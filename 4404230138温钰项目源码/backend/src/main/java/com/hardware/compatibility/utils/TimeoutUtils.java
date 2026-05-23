package com.hardware.compatibility.utils;

import java.util.concurrent.*;

/**
 * 超时工具类
 * 提供执行任务超时的功能
 */
public class TimeoutUtils {

    /**
     * 执行任务，超时时间为6秒
     * @param task 需要执行的任务
     * @param <T> 返回值类型
     * @return 任务执行结果
     * @throws TimeoutException 如果任务执行超时
     * @throws Exception 其他可能的异常
     */
    public static <T> T executeWithTimeout(Callable<T> task) throws TimeoutException, Exception {
        return executeWithTimeout(task, 6);
    }

    /**
     * 执行任务，自定义超时时间
     * @param task 需要执行的任务
     * @param timeout 超时时间，单位：秒
     * @param <T> 返回值类型
     * @return 任务执行结果
     * @throws TimeoutException 如果任务执行超时
     * @throws Exception 其他可能的异常
     */
    public static <T> T executeWithTimeout(Callable<T> task, long timeout) throws TimeoutException, Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<T> future = executor.submit(task);
        
        try {
            return future.get(timeout, TimeUnit.SECONDS);
        } finally {
            future.cancel(true);
            executor.shutdown();
        }
    }
}
