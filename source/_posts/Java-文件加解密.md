---
title: 文件加解密
tags: [encrypt,decrypt]
categories: [SpringBoot]
---

## 文件与字串
* 文件的操作流程一般为:打开–>读取–>对内容进行变换–>写入–>关闭
* 常规性文件操作会用到的类有五个:File,InputStream,OutputStream,FileInoutStream,FileOutputStream,均包含在java.io下面。注意,在使用前必须对类文件进行导入,方法为import java.io.File(实现时需要分号结尾)
* 创建InputStream类和OutputStream类的对象时,new关键字后边的类分别是FileInputStream和FileOutputStream(而不是其自身),如InputStream fin = new FileInputStream(File objectFile)。可以看出构造参数是File类型对象,其创建方式为File file = new File(String fileName)
* 当String类对象作为函数参数时,可以直接传入常量字符串,如“D:\source.jpg”。String类对象构造方法中比较简单也是最常用的一种是String string = “string content”,当然,最终执行的是String string = new String(“string content”)。其实String是非常重要的类(可以说无处不在),提供了一套完善、高效操作字串的方法,使得开发者受益匪浅
* 常规性文件操作涉及到的方法有五个:exist(),read(),write(),flush(),close()。exist()判断文件是否存在,调用者为File类对象；read()读取输入流中的内容,调用者为InputStream类对象；write()、flush()、close()的作用分别为向输出流中写内容、强制发送缓冲区中数据、保存并关闭文件,调用者为OutputStream类对象,不过InputStream类对象在操作完成后也需要close()

## 加密算法
* MD5:以512位分组来处理输入的信息,且每一分组又被划分为16个32位子分组,经过了一系列的处理后,输出由四个32位分组组成,将这四个32位分组级联后将生成一个128位散列值
* SHA:接收一段明文,然后以一种不可逆的方式将它转换成一段(通常更小)密文,也可以简单的理解为取一串输入码(称为预映射或信息),并把它们转化为长度较短、位数固定的输出序列即散列值(也称为信息摘要或信息认证代码)的过程
* DES:把64位的明文输入块变为64位的密文输出块,它所使用的密钥也是64位,主要分为两步:
  * 1.初始置换,把输入的64位数据块按位重新组合,并把输出分为L0、R0两部分,每部分各长32位,其置换规则为将输入的第58位换到第一位,第50位换到第2位…依此类推,最后一位是原来的第7位。L0、R0则是换位输出后的两部分,L0是输出的左32位,R0是右32位。
  * 2.逆置换,经过16次迭代运算后,得到L16、R16,将此作为输入,进行逆置换,逆置换正好是初始置换的逆运算,由此即得到密文输出。
* 3-DES:使用3条56位的密钥对数据进行三次加密,是DES向AES过渡的加密算法(1999年,NIST将3-DES指定为过渡的加密标准)
* AES:使用128、192、和256位密钥,并且用128位分组加密和解密数据
* 异或:与其说这是一种加密算法,倒不如称其为文件信息的简单变换,将每一个数据与某给定数据进行异或操作即可完成加密或解密,如dataEncrypt = dataSource^dataSecret

## 实例
* 给定的加密秘钥（异或数据，可以在合法范围内随便定义）为十六进制数0x99
```
	private static final int numOfEncAndDec = 0x99; //加密解密秘钥
    private static int dataOfFile = 0; //文件字节内容

    public static void main(String[] args) throws IOException {
        File srcFile = new File("D:\\abv.txt"); //初始文件
        File encFile = new File("D:\\haha.txt"); //加密文件
        File decFile = new File("D:\\123.txt"); //解密文件

        try {
            EncFile(srcFile, encFile); //加密操作
            DecFile(encFile,decFile);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void EncFile(File srcFile, File encFile) throws Exception {
            if(!srcFile.exists()){
                System.out.println("source file not exixt");
                return;
            }

            if(!encFile.exists()){
                System.out.println("encrypt file created");
                encFile.createNewFile();
            }
            InputStream fis  = new FileInputStream(srcFile);
            OutputStream fos = new FileOutputStream(encFile);

            while ((dataOfFile = fis.read()) > -1) {
                fos.write(dataOfFile^numOfEncAndDec);
            }

        fis.close();
        fos.flush();
        fos.close();
    }

    private static void DecFile(File encFile, File decFile) throws Exception {

        if(!encFile.exists()){
            System.out.println("encrypt file not exixt");
            return;
        }

        if(!decFile.exists()){
            System.out.println("decrypt file created");
            decFile.createNewFile();
        }
        InputStream fis  = new FileInputStream(encFile);
        OutputStream fos = new FileOutputStream(decFile);

        while ((dataOfFile = fis.read()) > -1) {
            fos.write(dataOfFile^numOfEncAndDec);
        }

        fis.close();
        fos.flush();
        fos.close();
    }
```

## 上传和下载文件(加密和解密)
使用 Jersey 服务器实现上传，使用 HTTP 请求实现下载
在 pom.xml 中添加 Jersey 相关依赖

<dependency>
    <groupId>com.sun.jersey</groupId>
    <artifactId>jersey-client</artifactId>
    <version>1.18.1</version>
</dependency>

```
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientHandlerException;
import com.sun.jersey.api.client.UniformInterfaceException;
import com.sun.jersey.api.client.WebResource;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

public class FileUtils {

    // 加密/解密文件的密钥
    public static final int CRYPTO_SECRET_KEY = 0x99;

    public static int FILE_DATA = 0;

    /**
     * 加密/解密 文件
     * @param srcFile 原文件
     * @param encFile 加密/解密后的文件
     * @throws Exception
     */
    public static void cryptoFile(File srcFile, File encFile) throws Exception {

        InputStream inputStream = new FileInputStream(srcFile);
        OutputStream outputStream = new FileOutputStream(encFile);
        while ((FILE_DATA = inputStream.read()) > -1) {
            outputStream.write(FILE_DATA ^ CRYPTO_SECRET_KEY);
        }
        inputStream.close();
        outputStream.flush();
        outputStream.close();
    }

    /**
     * MultipartFile 生成临时文件
     * @param multipartFile
     * @param tempFilePath 临时文件路径
     * @return File 临时文件
     */
    public static File multipartFileToFile(MultipartFile multipartFile, String tempFilePath) {

        File file = new File(tempFilePath);
        // 获取文件原名
        String originalFilename = multipartFile.getOriginalFilename();
        // 获取文件后缀
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
        if (!file.exists()) {
            file.mkdirs();
        }
        // 创建临时文件
        File tempFile = new File(tempFilePath + "\\" + UUID.randomUUID().toString().replaceAll("-", "") + suffix);
        try {
            if (!tempFile.exists()) {
                // 写入临时文件
                multipartFile.transferTo(tempFile);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return tempFile;
    }

    /**
     * 上传文件
     * @param fileServerPath    文件服务器地址
     * @param folderPath    存放的文件夹路径（比如存放在文件服务器的 upload 文件夹下，即 ”/upload“）
     * @param uploadFile    需要上传的文件
     * @param isCrypto    是否加密
     * @return String    文件上传后的全路径
     */
    public static String uploadByJersey(String fileServerPath, String folderPath, File uploadFile, boolean isCrypto) {

        String suffix = uploadFile.getName().substring(uploadFile.getName().lastIndexOf("."));
        String randomFileName = UUID.randomUUID().toString().replaceAll("-", "") + suffix;
        String fullPath = fileServerPath + folderPath + "/" + randomFileName;
        try {
            if (isCrypto) {
                // 创建加密文件
                File cryptoFile = new File(uploadFile.getPath().substring(0, uploadFile.getPath().lastIndexOf(".")) + "crypto" + uploadFile.getPath().substring(uploadFile.getPath().lastIndexOf(".")));
                // 执行加密
                cryptoFile(uploadFile, cryptoFile);
                // 保存加密后的文件
                uploadFile = cryptoFile;
            }
            // 创建 Jersey 服务器
            Client client = Client.create();
            WebResource wr = client.resource(fullPath);
            // 上传文件
            wr.put(String.class, fileToByte(uploadFile));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return fullPath;
    }

    /**
     * 下载文件
     * @param url   文件路径
     * @param filePath  文件保存路径
     * @param fileName    文件名称（包含文件后缀）
     * @param isCrypto  是否解密
     * @return File
     */
    public static File downloadByURL(String url, String filePath, String fileName, boolean isCrypto) {

        File file = new File(filePath);
        if (!file.exists()) {
            file.mkdirs();
        }
        FileOutputStream fileOut;
        HttpURLConnection httpURLConnection;
        InputStream inputStream;
        try {
            URL httpUrl = new URL(url);
            httpURLConnection = (HttpURLConnection) httpUrl.openConnection();
            httpURLConnection.setDoInput(true);
            httpURLConnection.setDoOutput(true);
            httpURLConnection.setUseCaches(false);
            httpURLConnection.connect();
            inputStream = httpURLConnection.getInputStream();
            BufferedInputStream bufferedInputStream = new BufferedInputStream(inputStream);
            if (!filePath.endsWith("\\")) {
                filePath += "\\";
            }
            file = new File(filePath + fileName);
            fileOut = new FileOutputStream(file);
            BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(fileOut);
            byte[] bytes = new byte[4096];
            int length = bufferedInputStream.read(bytes);
            //保存文件
            while (length != -1) {
                bufferedOutputStream.write(bytes, 0, length);
                length = bufferedInputStream.read(bytes);
            }
            bufferedOutputStream.close();
            bufferedInputStream.close();
            httpURLConnection.disconnect();
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (isCrypto) {
            try {
                // 创建解密文件
                File cryptoFile = new File(((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest().getServletContext().getRealPath("/") +  "\\temp\\" + UUID.randomUUID().toString().replaceAll("-", "") + file.getName().substring(file.getName().lastIndexOf(".")));
                // 执行解密
                cryptoFile(file, cryptoFile);
                // 删除下载的原文件
                file.delete();
                // 保存解密后的文件
                file = cryptoFile;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return file;
    }

    /**
     * 删除文件服务器上的文件
     * @param url 文件路径
     * @return boolean
     */
    public static boolean deleteByJersey(String url) {

        try {
            Client client = new Client();
            WebResource webResource = client.resource(url);
            webResource.delete();
            return true;
        } catch (UniformInterfaceException e) {
            e.printStackTrace();
        } catch (ClientHandlerException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * File转Bytes
     * @param file
     * @return byte[]
     */
    public static byte[] fileToByte(File file) {

        byte[] buffer = null;
        try {
            FileInputStream fileInputStream = new FileInputStream(file);
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            byte[] bytes = new byte[1024];
            int n;
            while ((n = fileInputStream.read(bytes)) != -1) {
                byteArrayOutputStream.write(bytes, 0, n);
            }
            fileInputStream.close();
            byteArrayOutputStream.close();
            buffer = byteArrayOutputStream.toByteArray();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return buffer;
    }
}

```
### 测试上传
```
/**
 * @param multipartFile 上传文件
 * @param isCrypto 是否加密文件
 * @return
 */
@Test
public String upload(MultipartFile multipartFile, boolean isCrypto) {

    HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
    // 生成临时文件
    File tempFile = FileUtil.multipartFileToFile(multipartFile, request.getServletContext().getRealPath("/") + "\\static\\temp");
    // 上传文件并返回文件路径
    String uploadFilePath = FileUtil.uploadByJersey("http://localhost:8080", "/upload", tempFile, isCrypto);
    if (uploadFilePath != null) {
        return "上传成功";
    }
    else {
        return "上传失败";
    }
}
```

