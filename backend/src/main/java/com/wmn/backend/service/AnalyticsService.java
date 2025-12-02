package com.wmn.backend.service;

import com.wmn.backend.utils.CommonUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.utils.IoUtils;
import software.amazon.awssdk.services.glue.GlueClient;
import software.amazon.awssdk.services.glue.model.GetJobRunRequest;
import software.amazon.awssdk.services.glue.model.GetJobRunResponse;
import software.amazon.awssdk.services.glue.model.GlueException;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class AnalyticsService {


    public byte[] downloadAnalyticsReport() {
        String latestObjectKey = "";
        try {
            S3Client s3Client = S3Client.builder()
                    .region(CommonUtils.REGION)
                    .build();

            List<S3Object> objectSummaries = CommonUtils.listFilesInFolder(s3Client, CommonUtils.BUCKET_NAME, CommonUtils.FOLDER_PREFIX);
            if (objectSummaries.isEmpty()) {
                log.info("No files found in the specified S3 folder.");
                return null; // No file found
            }

            Optional<S3Object> latestObjectOpt = objectSummaries.stream()
                    .filter(obj -> obj.size() > 0)
                    .max(Comparator.comparing(S3Object::lastModified));

            if (latestObjectOpt.isPresent()) {
                S3Object latestObject = latestObjectOpt.get();
                latestObjectKey = latestObject.key();

                log.info("Latest file identified: {} (Last Modified: {})", latestObjectKey, latestObject.lastModified());

                GetObjectRequest req = GetObjectRequest.builder()
                        .bucket(CommonUtils.BUCKET_NAME)
                        .key(latestObjectKey)
                        .build();

                ResponseInputStream<GetObjectResponse> s3Stream = s3Client.getObject(req);
                byte[] data = IoUtils.toByteArray(s3Stream);

                log.info("Download complete. File size: {} bytes. File name {}", data.length, latestObjectKey);
                return data;
            }

        } catch (S3Exception e) {
            log.warn("S3 object not found or access denied: {}/{}", CommonUtils.BUCKET_NAME, latestObjectKey, e);
            throw new RuntimeException("S3 object not found or access denied");
        } catch (Exception e) {
            log.error("Error retrieving S3 object {}/{}", CommonUtils.BUCKET_NAME, latestObjectKey, e);
            throw new RuntimeException("Error retrieving S3 object");
        }
        return null;
    }

    public String getJobStatus(String jobId) {
        String jobName = "wmngluejob";
        try (GlueClient glueClient = GlueClient.create()) {
            // Fetch the job run details using jobId
            GetJobRunRequest request = GetJobRunRequest.builder()
                    .jobName(jobName)
                    .runId(jobId)
                    .build();

            GetJobRunResponse response = glueClient.getJobRun(request);

            // Extract and return the status
            return response.jobRun().jobRunStateAsString();

        } catch (GlueException e) {
            System.err.println("Error fetching Glue job status: " + e.awsErrorDetails().errorMessage());
            return "ERROR";
        }
    }
}
