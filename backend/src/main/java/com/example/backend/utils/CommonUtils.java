package com.example.backend.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class CommonUtils {

    public static String getcurrentTimeStamp() {
        LocalDateTime now = LocalDateTime.now();

// Define the format
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
// Format the current date and time
        String formattedNow = now.format(formatter);

        return formattedNow;
    }
}
