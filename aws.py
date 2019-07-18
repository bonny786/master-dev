import http.client
import socket
socket.getaddrinfo('localhost', 8080)
conn = http.client.HTTPConnection("1d4ru8lsbh,execute-api,us-east-1,amazonaws,com")

headers = {
    'Content-Type': "application/json",
    'Host': "1d4ru8lsbh.execute-api.us-east-1.amazonaws.com",
    'X-Amz-Date': "20190702T120711Z",
    'Authorization': "AWS4-HMAC-SHA256 Credential=AKIAIWV64SOAVLNQWRFA/20190702/us-east-1/execute-api/aws4_request, SignedHeaders=content-type;host;x-amz-date, Signature=7cde4406c976f14e02a2cfbad50b05d2b855cbf700c9e055b104b1a2dcef5583",
    'cache-control': "no-cache",
    'Postman-Token': "d75b0d5c-20fe-44cd-81a9-2584f465e8f2"
    }

conn.request("POST", "default", headers=headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))