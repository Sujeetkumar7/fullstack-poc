package com.wmn.backend.service;
import com.wmn.backend.utils.CommonUtils;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.io.File;
import java.nio.file.Paths;

@Service
public class S3Service {

    private final S3Client s3Client;

    public S3Service() {
        this.s3Client = S3Client.builder()
                .region(CommonUtils.REGION)
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    public String downloadFile(String bucketName, String key, String downloadPath) {
        try {
            File localFile = Paths.get(downloadPath).toFile();

            s3Client.getObject(GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build(),
                    ResponseTransformer.toFile(localFile));

            return "File downloaded successfully to: " + localFile.getAbsolutePath();
        } catch (Exception e) {
            throw new RuntimeException("Error downloading file from S3", e);
        }
    }
}
