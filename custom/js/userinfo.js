// 获取ip
function getIpInfo(){
    var fetchUrl = "https://api.nsmao.net/api/ipv4/query?key=z2BvRnlFZnm1OrqZvegaLjv3mG" //https://api.nsmao.net获取key
    fetch(fetchUrl)
      .then(res => res.json())
      .then(json =>{
        var country = json.data.country || "未能获取到信息";
        var ip = json.data.ip || "未能获取到信息";
        var province = json.data.province || "未能获取到信息";
        var city = json.data.city || "未能获取到信息";
        var isp = json.data.isp || "未能获取到信息";
  
        document.getElementById("userAgentIp").innerHTML = ip;
        document.getElementById("userAgentCountry").innerHTML = country;
        document.getElementById("userAgentProv").innerHTML = province;
        document.getElementById("userAgentCity").innerHTML = city;
        document.getElementById("userAgentISP").innerHTML = isp;
  
        // 使用ua-parser-js解析User-Agent
        var parser = new UAParser();
        var result = parser.getResult();
        document.getElementById("userAgentOS").innerHTML = result.os.name + " " + result.os.version;
        document.getElementById("userAgentBrowser").innerHTML = result.browser.name + " " + result.browser.version;
      })
  }
  
  getIpInfo()