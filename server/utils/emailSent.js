const nodemailer = require("nodemailer");
const { format, subDays } = require("date-fns");
const AccessWireSchema = require("../Schema/AccessWireModel");
const BusinessWireSchema = require("../Schema/BusinessWireModel");
const GlobeNewsWireSchema = require("../Schema/GlobeNewsWireModel");
const NewsFileSchema = require("../Schema/NewsFileModel");
const PRNewsWireSchema = require("../Schema/PRNewsWireModel");

const emailSent = async (req, res, getAllNews, firmData, newsSchema, flag) => {
  const processedTickerSymbols = new Set();

  if (getAllNews.length === 0) {
    console.log("Inside_If")
    // No previous news, save all firm data and respond
    firmData.forEach(async function (data) {
      const newResponse = data.payload;
      const newNews = new newsSchema({
        firm: data.firm,
        payload: newResponse,
      });
      await newNews.save();
    });
    {
      flag !== true && res.json(firmData);
    }
  } else if (getAllNews.length !== firmData.length) {
    console.log("Inside_ElseIf")
    // Comparing ticker with previous 60 days ticker and send mail
    for (const data of firmData) {
      // If ticker symbol is not found in previous news, proceed
      const newlyTickerDate = data.payload.dateTimeIssued;
      const formattedDate = format(newlyTickerDate, "MMMM dd, yyyy");
      const sixtyDaysBefore = subDays(formattedDate, 60);
      const formattedDateSixtyDay = format(sixtyDaysBefore, "MMMM dd, yyyy");
      const dateToCompare = new Date(formattedDateSixtyDay);
      const newsWithinSixtyDays = getAllNews.filter(
        (compareNews) =>
          dateToCompare < new Date(compareNews.payload.dateTimeIssued)
      );

      if (
        !newsWithinSixtyDays.some(
          (compareSixtyNews) =>
            compareSixtyNews.payload.tickerSymbol === data.payload.tickerSymbol
        )
      ) {
        // Check if the ticker symbol exists in the database
        const existingNews = await newsSchema.findOne({
          "payload.tickerSymbol": data.payload.tickerSymbol
        });

        const agenciesDuplicateTickerSymbol = async () => {
          const getAllBusinessNews = await BusinessWireSchema.find();

          if(getAllBusinessNews){
            const boolTicker = getAllBusinessNews?.find((tickerSymbolFind) => tickerSymbolFind.payload.tickerSymbol === data?.payload.tickerSymbol)
            if (boolTicker) {
              return true
            } 
          }

          const getAllAccessWireNews = await AccessWireSchema.find();

          if(getAllAccessWireNews){
            const boolTicker = getAllAccessWireNews?.find((tickerSymbolFind) => tickerSymbolFind.payload.tickerSymbol === data?.payload.tickerSymbol)
            if (boolTicker) {
              return true
            } 
          }

          const getAllGlobeNewsWire = await GlobeNewsWireSchema.find();

          if(getAllGlobeNewsWire){
            const boolTicker = getAllGlobeNewsWire?.find((tickerSymbolFind) => tickerSymbolFind.payload.tickerSymbol === data?.payload.tickerSymbol)
            if (boolTicker) {
              return true
            } 
          }

          const getAllNewsFile = await NewsFileSchema.find();

          if(getAllNewsFile){
            const boolTicker = getAllNewsFile?.find((tickerSymbolFind) => tickerSymbolFind.payload.tickerSymbol === data?.payload.tickerSymbol)
            if (boolTicker) {
              return true
            } 
          }

          const getAllPRNewsWire = await PRNewsWireSchema.find();

          if(getAllPRNewsWire){
            const boolTicker = getAllPRNewsWire?.find((tickerSymbolFind) => tickerSymbolFind.payload.tickerSymbol === data?.payload.tickerSymbol)
            if (boolTicker) {
              return true
            } 
          }
        }
        
        const checkDuplicateTickerSymbol = agenciesDuplicateTickerSymbol()
        if ( checkDuplicateTickerSymbol === true && flag === true){
          return
        }
        else {
          if (!existingNews || !processedTickerSymbols.has(data.payload.tickerSymbol)) {
            const newNews = new newsSchema({
              firm: data.firm,
              payload: data.payload,
            });
            await newNews.save();
  
            // If no news found for the ticker within 60 days and email not sent already, send email
            if (!processedTickerSymbols.has(data.payload.tickerSymbol)) {
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
                to: "akshay.bisht1@ftechiz.com",
                subject: `Alert: First Press Release for ${data?.payload?.tickerSymbol}`,
                html: `<p><span style='font-weight:bold;'>${data.firm}</span> issued a press release for <span style='font-weight:bold;'>${data?.payload?.tickerSymbol}</span>. This is the first press release observed for <span style='font-weight:bold;'>${data?.payload?.tickerSymbol}</span> in the past 60 days.<br/><br/>View the release here: ${data?.payload?.urlToRelease}.</p>`,
              };
  
              // Send the email
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return console.error("Error:", error.message);
                }
              });
              processedTickerSymbols.add(data.payload.tickerSymbol);
            }
          }
        }
        
      }
    }

    setTimeout(async () => {
      const response = await newsSchema.find();
      {
        flag !== true && res.json(response);
      }
    }, 1000);
  } else {
    const response = await newsSchema.find();
    {
      flag !== true && res.send(response);
    }
  }
};

module.exports = emailSent;
