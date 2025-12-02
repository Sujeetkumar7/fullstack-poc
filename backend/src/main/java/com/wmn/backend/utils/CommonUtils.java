package com.wmn.backend.utils;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

public class CommonUtils {

    public static final String TRANSACTION = "transaction";
    public static final String BUCKET_NAME = "wmnanalytics";
    public static final String FOLDER_PREFIX = "analytics-output/";
    public static final Region REGION = Region.AP_SOUTH_2;
    public static String getcurrentTimeStamp() {
        LocalDateTime now = LocalDateTime.now();

        // Define the format
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        // Format the current date and time
        String formattedNow = now.format(formatter);

        return formattedNow;
    }

    public static List<S3Object> listFilesInFolder(S3Client s3Client, String bucketName, String prefix) {
        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                .bucket(bucketName)
                .prefix(prefix)
                .build();

        return s3Client.listObjectsV2Paginator(listRequest)
                .stream()
                .flatMap(response -> response.contents().stream())
                .collect(Collectors.toList());
    }
}
