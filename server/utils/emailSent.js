const nodemailer = require("nodemailer");
const { format, subDays, parse } = require('date-fns');

const emailSent = async (req, res, getAllNews, firmData, newsSchema) => {

  ///////////////////Date and remove records limit 75/////////////////////

  //Delete news records if it's more than 75 days

  console.log("getAllNews.length !== firmData.length:", getAllNews.length, firmData.length);

  const calculateDate = async (data) => {
    console.log("Hello_Data11", data);

    // Current Date from current date to 75 days before
    const currentDate = new Date();
    const formattedCurrentDate = format(currentDate, "MMMM dd, yyyy");
    
    const seventyFiveDaysBefore = subDays(formattedCurrentDate, 75);

    const formattedDateSeventyFive = format(seventyFiveDaysBefore, "MMMM dd, yyyy");

    console.log("DaysBefore_75Days", formattedDateSeventyFive);

    const dateToCompare = new Date(formattedDateSeventyFive);

    setTimeout(async() => {
      const getAllNewsWire = await newsSchema.find();
      //console.log("Getting_Length:", getAllNews.length, getAllNewsWire.length);

      getAllNewsWire?.forEach(function (newsDetails, index) {

        //console.log("payload.dateTimeIssued:",newsDetails?.payload.dateTimeIssued);
        const allPRNewsDate = new Date(newsDetails?.payload.dateTimeIssued);
        
        //console.log("Response77:",allPRNewsDate);
  
        // Compare newly incoming ticker date from sixty records in DB
        // October 27, 2023 > October 25, 2023 153 - 91 = 62
        
        if (dateToCompare > allPRNewsDate) {
          //console.log("Deleted_News:", newsDetails._id)
          newsSchema.deleteOne({ _id: newsDetails._id })
          .then((data) => {
            console.log("News deleted successfully");
          })
          .catch((err) => {
            console.log("Error:",err);
          });
        }
      });
    }, 2000);

    setTimeout(async () => {
      const getAllNewsWireResp = await newsSchema.find();
      console.log("Database_Result:", getAllNewsWireResp.length);
    }, 5000);
  }

  if (getAllNews.length === 0) {
    console.log("NewsFirm_1");
    firmData.forEach(async function (data, index) {
      const newResponse = data.payload;
      const newNews = new newsSchema({ firm: data.firm, payload: newResponse });
      newNews.save();
    });
    res.json(firmData);
    //calculateDate("String_One");
  } 
  else if (getAllNews.length !== firmData.length) {
    console.log("NewsFirm_2");
    firmData.forEach(async function (data, index) {
      if (
        getAllNews.length > 0 &&
        getAllNews[index]?.urlToRelease !== data.payload.urlToRelease &&
        getAllNews[index] === undefined
      ) {
        firmData.push({ firm: data.firm, payload: data.payload });
        const newNews = new newsSchema({
          firm: data.firm,
          payload: data.payload,
        });
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
          html: `<p><span style='font-weight:bold;'>${data.firm}</span> issued a press release for <span style='font-weight:bold;'>${data?.payload?.tickerSymbol}</span>. This is the first press release observed for <span style='font-weight:bold;'>${data?.payload?.tickerSymbol}</span> in the past 60 days. View the release here: ${data?.payload?.urlToRelease}.</p>`,
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

    //calculateDate("String_Two");
    res.json(firmData);
  } else {
    console.log("NewsFirm_3");
    //calculateDate("String_Three");

    res.send(firmData);
  }
};

module.exports = emailSent;
