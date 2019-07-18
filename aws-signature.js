public HttpRequest requestFor(Map<String,String> parameters) {

    PageReference pr = new PageReference('https://' + this.service + '.' + this.region + '.amazonaws.com/');
    pr.getParameters().putAll(parameters);

    HttpRequest request = new HttpRequest();
    request.setMethod('GET');
    request.setEndpoint(pr.getUrl());

    Datetime now = Datetime.now();
    String iso8601time = now.formatGmt('YYYYMMdd\'T\'HHmmss\'Z\'');
    String iso8601date = now.formatGmt('YYYYMMdd');

    Map<String,String> headers = new Map<String,String>{
        'X-Amz-Date' => iso8601time,
        'Host' => this.service + '.amazonaws.com'
    };

    String payload = '';

    //Task 1: Create a Canonical Request for Signature Version 4
    String canonicalRequest = canonicalMethodFor('GET')
        + '\n' + canonicalUriFor(request.getEndpoint())
        + '\n' + canonicalQueryStringFor(parameters)
        + '\n' + canonicalHeadersFor(headers)
        + '\n' + signedHeadersFor(headers)
        + '\n' + hexEncodedHash(payload)
    ;

    String canonicalRequestHash = hexEncodedHash(canonicalRequest);

    //Task 2: Create a String to Sign for Signature Version 4
    String algorithm = 'AWS4-HMAC-SHA256';
    String termination = 'aws4_request';
    String credentialScope = iso8601date + '/' + region + '/' + service + '/' + termination;
    String stringToSign = algorithm + '\n' + iso8601time + '\n' + credentialScope + '\n' + canonicalRequestHash;

    //Task 3: Calculate the AWS Signature Version 4
    Blob keySecret = Blob.valueOf('AWS4' + secretKey);
    Blob keyDate = Crypto.generateMac('hmacSHA256', Blob.valueOf(iso8601date), keySecret);
    Blob keyRegion = Crypto.generateMac('hmacSHA256', Blob.valueOf(this.region), keyDate);
    Blob keyService = Crypto.generateMac('hmacSHA256', Blob.valueOf(this.service), keyRegion);
    Blob keySigning = Crypto.generateMac('hmacSHA256', Blob.valueOf('aws4_request'), keyService);

    Blob blobToSign = Blob.valueOf(stringToSign);
    Blob hmac = Crypto.generateMac('hmacSHA256', blobToSign, keySigning);
    String signature = EncodingUtil.convertToHex(hmac);

    //Task 4: Add the Signing Information to the Request
    String signedHeaders = signedHeadersFor(headers);
    String authorization = 'AWS4-HMAC-SHA256'
        + ' ' + 'Credential=' + accessKeyId + '/' + credentialScope
        + ', ' + 'SignedHeaders=' + signedHeaders
        + ', ' + 'Signature=' + signature
    ;

    //prepare headers
    request.setHeader('Authorization', authorization);
    for (String header : headers.keySet()) request.setHeader(header, headers.get(header));
    return request;
}

public class HelloAWS {
    Public Static String KEY = 'AKIA2TMFOQUVUDNXUPTK';
    Public Static String SECRET = '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';
    Public Static String BUCKETNAME = 'playareahd';
    Public Static String HOST = 's3.us-east-1.amazonaws.com';
    
    public void uploadBlob(String[] Ids){
        Attachment attach = [select ParentId,Body,ContentType,Name from Attachment where id = :Ids];//'00P1i000004GRVtEAO' limit 1];
        String attachmentBody = EncodingUtil.base64Encode(attach.Body);
        String formattedDateString = Datetime.now().formatGMT('EEE, dd MMM yyyy HH:mm:ss z');
        String filename = attach.Id + '-' + attach.Name;
        HttpRequest req = new HttpRequest();
        req.setMethod('PUT');
        req.setEndpoint('https://' + BUCKETNAME + '.' + HOST + '/' + filename);
        req.setHeader('Host', BUCKETNAME + '.' + HOST);
        req.setHeader('Content-Length', String.valueOf(attachmentBody.length()));
        req.setHeader('Content-Encoding', 'UTF-8');
        req.setHeader('Content-type', attach.ContentType);
        req.setHeader('Connection', 'keep-alive');
        req.setHeader('Date', formattedDateString);
        req.setHeader('ACL', 'public-read-write');
        req.setBodyAsBlob(attach.Body);
        String stringToSign = 'PUT\n\n' + attach.ContentType + '\n' + formattedDateString + '\n' + '/' + BUCKETNAME + '/' + filename;
        String encodedStringToSign = EncodingUtil.urlEncode(stringToSign, 'UTF-8');
        Blob mac = Crypto.generateMac('HMACSHA1', blob.valueof(stringToSign),blob.valueof(SECRET));
        String signedKey  = EncodingUtil.base64Encode(mac);
        String authHeader = 'AWS' + ' ' + KEY + ':' + signedKey ;
        req.setHeader('Authorization',authHeader);
        String decoded = EncodingUtil.urlDecode(encodedStringToSign , 'UTF-8');
        Http http = new Http();
        HTTPResponse res = http.send(req);
    }  
}

public class CognitoCallouts {

    public static HttpResponse makeGetCallout() {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://th-apex-http-callout.herokuapp.com/animals');
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        // If the request is successful, parse the JSON response.
        if (response.getStatusCode() == 200) {
            // Deserializes the JSON string into collections of primitive data types.
            Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            // Cast the values in the 'animals' key as a list
            List<Object> animals = (List<Object>) results.get('animals');
            System.debug('Received the following animals:');
            for (Object animal: animals) {
                System.debug(animal);
            }
        }
        return response;
    }
    public static HttpResponse makePostCallout(String EmailId) {
        // TBD : put these vars in a custom setting
        String UserPoolId = 'us-east-1_SpQcyv6cV';
        String ClientId = '34v4s9o8pcen9o5mpglv9e7jrl';
        String Passwd = 'Web@1884';
        String AccessKey = 'AKIAIWV64SOAVLNQWRFA';
        String SecretKey = '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';
        String Endpoint = 'https://1d4ru8lsbh.execute-api.us-east-1.amazonaws.com/default?UserPoolId='+UserPoolId+'&ClientId='+ClientId+'&email='+EmailId+'&password='+Passwd;
        //String Endpoint = 'https://1d4ru8lsbh.execute-api.us-east-1.amazonaws.com/default?UserPoolId='+UserPoolId+
        //                  EncodingUtil.urlEncode('&ClientId=','UTF-8')+ClientId+
        //                  EncodingUtil.urlEncode('&email=','UTF-8')+EmailId+
        //                  EncodingUtil.urlEncode('&password=','UTF-8')+Passwd;
    /*        
curl -X POST \
  'https://1d4ru8lsbh.execute-api.us-east-1.amazonaws.com/default?UserPoolId=us-east-1_SpQcyv6cV&ClientId=34v4s9o8pcen9o5mpglv9e7jrl&email=abc@bytik-flower.ru&password=Web@1884' \
  -H 'Authorization: AWS4-HMAC-SHA256 Credential=AKIAIWV64SOAVLNQWRFA/20190702/us-east-1/execute-api/aws4_request, SignedHeaders=content-type;host;x-amz-date, Signature=7cde4406c976f14e02a2cfbad50b05d2b855cbf700c9e055b104b1a2dcef5583' \
  -H 'Content-Type: application/json' \
  -H 'Host: 1d4ru8lsbh.execute-api.us-east-1.amazonaws.com' \
  -H 'Postman-Token: d174e242-095d-4bd4-8d1c-26b69ad80760' \
  -H 'X-Amz-Date: 20190702T120711Z' \
  -H 'cache-control: no-cache'
    */

        system.debug('Endpoint >>> '+Endpoint);
        //Endpoint = EncodingUtil.urlEncode(Endpoint,'UTF-8');
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        
        Endpoint = 'https://1d4ru8lsbh.execute-api.us-east-1.amazonaws.com/default?UserPoolId=us-east-1_SpQcyv6cV&ClientId=34v4s9o8pcen9o5mpglv9e7jrl&email=abc@bytik-flower.ru&password=Web@1884';
        request.setEndpoint(Endpoint);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        //request.setHeader('AccessKey', AccessKey);
        //request.setHeader('SecretKey', SecretKey);
        //request.setBody('{"AccessKey":"'+AccessKey+'","SecretKey":"'+SecretKey+'"}');
        //request.setBody('{"name":"mighty moose"}');
        
        //var client = new RestClient("https://1d4ru8lsbh.execute-api.us-east-1.amazonaws.com/default?UserPoolId=us-east-1_SpQcyv6cV&ClientId=34v4s9o8pcen9o5mpglv9e7jrl&email=abc@bytik-flower.ru&password=Web@1884");
        //var request = new RestRequest(Method.POST);
        
        Datetime now = Datetime.now();
        String iso8601time = now.formatGmt('YYYYMMdd\'T\'HHmmss\'Z\'');
        String iso8601date = now.formatGmt('YYYYMMdd');
        
        request.setHeader('host', 'https://1d4ru8lsbh.execute-api.us-east-1.amazonaws.com/default');
        request.setHeader('x-amz-date', iso8601time);
        String payload = '';
        //Task 1: Create a Canonical Request for Signature Version 4
        String canonicalRequest = 'POST\n' + 
                'content-type:' + 'application/json\n' + 
                'host:' +'https://1d4ru8lsbh.execute-api.us-east-1.amazonaws.com/default\n' + 
                'x-amz-date:' + iso8601time + '\n' + 
                'content-type;host;x-amz-date\n';
        String canonicalRequestHash = EncodingUtil.convertToHex(canonicalRequest);
        //Task 2: Create a String to Sign for Signature Version 4
        String algorithm = 'AWS4-HMAC-SHA256';
        String termination = 'aws4_request';
        String region = 'us-east-1';
        String service = 'execute-api';
        String credentialScope = iso8601date + '/' + region + '/' + service + '/' + termination;
        String stringToSign = algorithm + '\n' + iso8601time + '\n' + credentialScope + '\n' + canonicalRequestHash;
        //Task 3: Calculate the AWS Signature Version 4
        Blob keySecret = Blob.valueOf('AWS4' + SecretKey);
        Blob keyDate = Crypto.generateMac('hmacSHA256', Blob.valueOf(iso8601date), keySecret);
        Blob keyRegion = Crypto.generateMac('hmacSHA256', Blob.valueOf(region), keyDate);
        Blob keyService = Crypto.generateMac('hmacSHA256', Blob.valueOf(service), keyRegion);
        Blob keySigning = Crypto.generateMac('hmacSHA256', Blob.valueOf(termination), keyService);
        Blob blobToSign = Blob.valueOf(stringToSign);
        Blob hmac = Crypto.generateMac('hmacSHA256', blobToSign, keySigning);
        String signature = EncodingUtil.convertToHex(hmac);
        //Task 4: Add the Signing Information to the Request
        String authorization = 'AWS4-HMAC-SHA256'
            + ' ' + 'Credential=' + AccessKey + '/' + credentialScope
            + ', ' + 'SignedHeaders=content-type;host;x-amz-date'
            + ', ' + 'Signature=' + signature
        ;
        //prepare headers
        request.setHeader('Authorization', authorization);
        
        HttpResponse response = http.send(request);
        // Parse the JSON response
        if (response.getStatusCode() != 201) {
            System.debug('The status code returned was not expected: ' +
                response.getStatusCode() + ' ' + response.getStatus());
        } else {
            System.debug(response.getBody());
        }
        return response;
    }        
}

{
    "UserPoolId": "us-east-1_SpQcyv6cV",
    "ClientId": "34v4s9o8pcen9o5mpglv9e7jrl",
    "email":"abc@bytik-flower.ru",
    "password": "Web@1884"
    
}
{
    "UserPoolId": "$input.params('UserPoolId')",
    "ClientId": "$input.params('ClientId')",
    "email": "$input.params('email')",
    "password": "$input.params('password')"
}