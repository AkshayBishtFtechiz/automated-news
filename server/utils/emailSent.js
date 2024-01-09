const nodemailer = require("nodemailer");

const emailSent = async (req, res, getAllNews, firmData, newsSchema) => {

  if (getAllNews.length === 0) {
        firmData.forEach(async function (data, index) {
          const newResponse = data.payload;
          const newNews = new newsSchema({ firm: data.firm, payload: newResponse });
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
            console.log("dataFirm:",data)
            firmData.push({ firm: data.firm, payload: data.payload });
            const newNews = new newsSchema({ firm: data.firm, payload: data.payload });
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
              subject: `Alert: First Press Release for ${data?.payload?.tickerSymbol}`,
              html: `<p><p style='font-weight:bold;'>${data.firm}</p> issued a press release for <p style='font-weight:bold;'>${data?.payload?.tickerSymbol}</p>. This is the first press release observed for <p style='font-weight:bold;'>${data?.payload?.tickerSymbol}</p> in the past 60 days. View the release here: ${data?.payload?.urlToRelease}.</p>`,
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