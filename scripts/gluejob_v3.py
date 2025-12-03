
import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql import functions as F
from datetime import datetime
import boto3
import os

# Get job arguments
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# S3 bucket and folder details
bucket_name = "wmnanalytics"
folder_prefix = "analytics-output"

# Generate timestamped file name
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
file_name = f"Analytical_Report_{timestamp}.csv"
temp_path = f"s3://{bucket_name}/{folder_prefix}/temp_{timestamp}/"
final_key = f"{folder_prefix}/{file_name}"

# Read data from Glue Catalog
dyf = glueContext.create_dynamic_frame.from_catalog(
    database="wmndb",
    table_name="transaction"
)

# Convert to DataFrame
df = dyf.toDF()

# ✅ Fix: Convert BIGINT 'amount' to DOUBLE
df = df.withColumn("amount_double", F.col("amount").cast("double"))

# Handle nulls (optional)
df = df.na.fill({"amount_double": 0})

# Perform aggregations
analytics_df = (
    df.groupBy("user_id")
      .agg(
          F.count("*").alias("transaction_count"),
          F.sum("amount_double").alias("total_amount"),
          F.avg("amount_double").alias("average_amount"),
          F.min("amount_double").alias("min_amount"),
          F.max("amount_double").alias("max_amount")
      )
      .orderBy(F.desc("total_amount"))
)

# Write output to temporary folder as single file
analytics_df.coalesce(1).write.mode("overwrite").option("header", "true").csv(temp_path)

# Rename part file to desired timestamped file name
s3 = boto3.client('s3')
response = s3.list_objects_v2(Bucket=bucket_name, Prefix=f"{folder_prefix}/temp_{timestamp}/")

part_file = None
for obj in response.get('Contents', []):
    if obj['Key'].endswith('.csv'):
        part_file = obj['Key']
        break

if part_file:
    s3.copy_object(
        Bucket=bucket_name,
        CopySource={'Bucket': bucket_name, 'Key': part_file},
        Key=final_key
    )
    s3.delete_object(Bucket=bucket_name, Key=part_file)
    s3.delete_object(Bucket=bucket_name, Key=f"{folder_prefix}/temp_{timestamp}/_SUCCESS")
    print(f"File successfully written as {file_name} in {folder_prefix}/")

job.commit()
