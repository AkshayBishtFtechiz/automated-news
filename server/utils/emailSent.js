const nodemailer = require("nodemailer");

const emailSent = async (req, res, getAllNews, firmData, newsSchema) => {

  if (getAllNews.length === 0) {
        firmData.forEach(async function (data, index) {
          const newResponse = data.payload;
          const newNews = new newsSchema(newResponse);
          newNews.save();
        });
        res.json(firmData);
      }
  else if (getAllNews.length !== firmData.length) {
        firmData.forEach(async function (data, index) {
          if (
            getAllNews.length > 0 &&
            getAllNews[index]?.urlToRelease !==
              data.payload.urlToRelease &&
            getAllNews[index] === undefined
          ) {
            firmData.push({ firm: data.firm, payload: data.payload });
            const newNews = new newsSchema(data.payload);
            newNews.save();
  
            // Sending Email
  
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "automatednews21@gmail.com",
                pass: "ovig lcvq nfdn whsj",
              },
              secure: false,
              port: 25,
              tls: {
                rejectUnauthorized: false,
              },
            });
  
            // Define the email options
            const mailOptions = {
              from: "automatednews21@gmail.com",
              to: "shubham.pal@ftechiz.com",
              subject: "Newly Discovered Ticker",
              html:
                "<h1>Ticker</h1> " +
                data?.payload?.tickerSymbol +
                "<h2 style='font- weight:bold;'> Url to Release </h2>" +
                data?.payload?.urlToRelease,
            };
  
            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.error("Error:", error.message);
              }
              console.log("Email sent:", info.response);
            });
          }
        });
  
        res.json(firmData);
      } else {
        res.send(firmData);
      }
}

module.exports = emailSent;