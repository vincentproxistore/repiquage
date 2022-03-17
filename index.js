var fs = require("fs");
const csv = require("csv-parser");
var copy = require("recursive-copy");
const { zip } = require("zip-a-folder");
const fsExtra = require("fs-extra");
const path = require('path');

const express = require('express');

const app = express();
const port = process.env.PORT || 8000;

// sendFile will go here

app.get('', function(req, res) {
  // console.log(req)
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/generate', (req, res) => {
  const shouldUseAdsquare = req.query.withAdsquare === 'true';
  fs.createReadStream("./input/input.csv")
    .pipe(csv())
    .on("data", (row) => {
      fsExtra.emptyDirSync("./output");
      readHtmlFile(row, shouldUseAdsquare);
    })
    .on("end", (e) => {
      console.log("CSV file successfully processed");
    });
})

app.listen(port);
console.log('Server started at http://localhost:' + port);

const FORMATS = ["half-page", "leaderboard", "rectangle"];



function replaceCustomTagsByCsvValues(row, htmlContent) {
  for (const key in row) {
    if (Object.hasOwnProperty.call(row, key)) {
      htmlContent = htmlContent.replace(`{${key}}`, row[key]);
    }
  }
  console.log(htmlContent);
  return htmlContent;
}

function insertPxsClickTrackerTag(htmlContent, shouldUseAdsquare) {
  // this will remove original redirection url which might break our custom redirection click tag
  const regex = /a href=\"(.*?)\">/gi;
  htmlContent = htmlContent.replace(regex, '');
  return htmlContent.replace("</body>", generatePxsClickTag(shouldUseAdsquare));
}

function generatePxsClickTag(shouldUseAdsquare) {
  if (shouldUseAdsquare) {
    return `<script>
    function getSmartTrafikUrlRedirection(advertisement) {
      return (
        'https://audience-api.wts-okube.com/redirect?brand_slug=proxistore&module=dclic&campaign_id=proxdwm_' +
        advertisement.advertisementId +
        '&redirect_url=' +
        advertisement.urlRedirection
      );
    } 

    // listener sur l'event message
	window.addEventListener('message', function(event) {
	  	const { data } = event;
		const { host } = event.srcElement.location;
        // on verifie que le host de la source vient bien de chez proxi
		if (host === 'proximedia.s3.eu-central-1.amazonaws.com' || host === 'images.proxistore.com' && data.advertisementId) {
    	document.body.addEventListener('click', function() {
            // en cas de click on appelle notre be pour qu'il incrémente les clicks
			ajax(
				'//abs.proxistore.com/fr/tags/click/'+data.advertisementId,
				'PUT',
				JSON.stringify({
					publisherSpotReferenceId: data.publisherSpotReferenceId,
					campaignId: data.campaignId,
                    dealId: data.dealId
				}),
				'application/json; charset=utf-8'
			);
            // changer l'url par celle envoyer par le client

			window.open(getSmartTrafikUrlRedirection(data))
			});
	}
	});
	
	function ajax(url, method, data) {
	  return new Promise(function(resolve, reject) {
	    const request = new XMLHttpRequest();
	    request.onreadystatechange = function() {
	      if (request.readyState === XMLHttpRequest.DONE) {
	        if (request.status >= 200 && request.status < 300) {
	          resolve(request.responseText);
	        } else {
	          reject(Error(request.statusText));
	        }
	      }
	    };
	    request.onerror = function() {
	      reject(Error('Network Error'));
	    };
	    request.withCredentials = true;
	    request.open(method, url, true);
	    request.setRequestHeader('Content-Type', 'application/json');
	    request.send(data);
	  });
}
</script>
`;
  }
  return `</body>
  <script>

  // listener sur l'event message
window.addEventListener('message', function(event) {
    const { data } = event;
  const { host } = event.srcElement.location;
      // on verifie que le host de la source vient bien de chez proxi
  if (host === 'proximedia.s3.eu-central-1.amazonaws.com' || host === 'images.proxistore.com' && data.advertisementId) {
    document.body.addEventListener('click', function() {
          // en cas de click on appelle notre be pour qu'il incrémente les clicks
    ajax(
      '//abs.proxistore.com/fr/tags/click/" +data.advertisementId',
      'PUT',
      JSON.stringify({
        publisherSpotReferenceId: data.publisherSpotReferenceId,
        campaignId: data.campaignId,
                  dealId: data.dealId
      }),
      'application/json; charset=utf-8'
    );
          // changer l'url par celle envoyer par le client

    window.open('{CLICKTAG}')
    });
}
});

function ajax(url, method, data) {
  return new Promise(function(resolve, reject) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status >= 200 && request.status < 300) {
          resolve(request.responseText);
        } else {
          reject(Error(request.statusText));
        }
      }
    };
    request.onerror = function() {
      reject(Error('Network Error'));
    };
    request.withCredentials = true;
    request.open(method, url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(data);
  });
}
</script>`;
}

function readHtmlFile(row, shouldUseAdsquare) {
  console.log(row);
  FORMATS.forEach((format) => {
    fs.readFile(
      __dirname + `/input/${format}/index.html`,
      { encoding: "utf-8" },
      function (err, htmlContent) {
        if (!err) {
          htmlContent = insertPxsClickTrackerTag(htmlContent, shouldUseAdsquare);
          htmlContent = replaceCustomTagsByCsvValues(row, htmlContent);
          createOutputFolders(htmlContent, row["CITY"], format);
        } else {
          console.log(err);
        }
      }
    );
  });
}

function createOutputFolders(htmlContent, city, format) {
  var dir = `./output/${city}`;

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  var subDir = `./output/${city}/${format}`;
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir);
    copyFilesToOuput(city, format, htmlContent);
  }
}

function copyFilesToOuput(city, format, htmlContent) {
  const srcDir = `./input/${format}`;
  const destDir = `./output/${city}/${format}`;

  copy(srcDir, destDir)
    .then(function (results) {
      console.info("Copied " + results.length + " files");
      generateIndexHtml(htmlContent, city, format);
    })
    .catch(function (error) {
      console.error("Copy failed: " + error);
    });
}

function generateIndexHtml(htmlContent, city, format) {
  fs.writeFile(
    __dirname + `/output/${city}/${format}/index.html`,
    htmlContent,
    function (err) {
      if (err) {
        console.error("GenerateIndexHtmlError for " + city);
        return console.log(err);
      }
      zip(
        `./output/${city}/${format}`,
        `./output/${city}/${city}__${format}.zip`
      ).then(
        (success) => console.log(`File: ${city}__${format} zipped properly`),
        (error) => console.error(error)
      );
    }
  );
}
