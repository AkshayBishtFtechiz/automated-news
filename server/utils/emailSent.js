const nodemailer = require("nodemailer");
const { format, subDays, parse } = require("date-fns");

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
    // Comparing ticker with previous 60 days tikcer and send mail

    firmData.forEach(async function (data, index) {
      if (
        getAllNews.length > 0 &&
        getAllNews[index]?.payload.scrapId !== data.payload.scrapId &&
        getAllNews[index] === undefined
      ) {
        firmData.push({ firm: data.firm, payload: data.payload });

        const newlyTickerDate = data.payload.dateTimeIssued;

        const formattedDate = format(newlyTickerDate, "MMMM dd, yyyy");

        const sixtyDaysBefore = subDays(formattedDate, 60);

        const formattedDateSixtyDay = format(sixtyDaysBefore, "MMMM dd, yyyy");

        const dateToCompare = new Date(formattedDateSixtyDay);

        const newsWithinSixtyDays = getAllNews.filter(
          (compareNews, index) =>
            dateToCompare < new Date(compareNews.payload.dateTimeIssued)
        );

        const compareTickerSymbol = newsWithinSixtyDays.filter(
          (compareSixtyNews, index) =>
            compareSixtyNews.payload.tickerSymbol === data.payload.tickerSymbol
        );
        
        if (compareTickerSymbol.length === 0) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "blocklevitonalerts@gmail.com",
              pass: "yrhc nqwl gmah odvp",
            },
            secure: false,
            port: 25,
            tls: {
              rejectUnauthorized: false,
            },
          });

          // Define the email options
          const mailOptions = {
            from: "blocklevitonalerts@gmail.com",
            to: "shubham.pal@ftechiz.com",
            subject: `Alert: First Press Release for ${data?.payload?.tickerSymbol}`,
            html: `<p><span style='font-weight:bold;'>${data.firm}</span> issued a press release for <span style='font-weight:bold;'>${data?.payload?.tickerSymbol}</span>. This is the first press release observed for <span style='font-weight:bold;'>${data?.payload?.tickerSymbol}</span> in the past 60 days.<br/><br/>View the release here: ${data?.payload?.urlToRelease}.</p>`,
          };

          // Send the email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.error("Error:", error.message);
            }
          });

          const newNews = new newsSchema({
            firm: data.firm,
            payload: data.payload,
          });
          newNews.save();
        }
      }
    });
    setTimeout(async () => {
      const response = await newsSchema.find();
      res.json(response);
    }, 1000);
  } else {
    const response = await newsSchema.find();
    res.send(response);
  }
};

module.exports = emailSent;
