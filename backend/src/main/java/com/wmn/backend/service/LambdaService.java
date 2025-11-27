package com.wmn.backend.service;

import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.lambda.LambdaClient;
import software.amazon.awssdk.services.lambda.model.InvokeRequest;
import software.amazon.awssdk.services.lambda.model.InvokeResponse;

@Service
public class LambdaService {

    private final LambdaClient lambdaClient;

    public LambdaService() {
        this.lambdaClient = LambdaClient.builder()
                .region(Region.AP_SOUTH_2)
                .build();
    }

    public String invokeLambda() {
        InvokeRequest request = InvokeRequest.builder()
                .functionName("FunctionToTriggerGlueJob")
                .payload(SdkBytes.fromUtf8String(""))
                .build();

        InvokeResponse response = lambdaClient.invoke(request);
        return response.payload().asUtf8String();
    }
}
