import axios from "axios";
import crypto from "crypto";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; // Import the CORS package

const app = express();
const PORT = 3000;

const PAYWAY_COF_URL =
  "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/cof/initial";
const PUBLIC_KEY = "ea9bfc2528301a4bfd8d5ffb6fb69ea599fb0daa"; // Replace with your actual public key
const MERCHANT_ID = "ec439285"; // Replace with your actual merchant ID

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use CORS middleware to allow requests from localhost:8080
app.use(
  cors({
    origin: "http://localhost:8080", // Allow requests from this origin
    methods: ["GET", "POST"], // Allow specific HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
  })
);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());

// Endpoint to call PayWay Add Card API
app.post("/add-card", async (req, res) => {
  const ctid = "customer_unique_id_123"; // Unique identifier for the customer
  const returnParam = "additional_info"; // Additional info to be returned in pushback

  // Prepare required fields
  const requestData = {
    merchant_id: MERCHANT_ID,
    ctid: ctid,
    return_param: returnParam,
    firstname: "John",
    lastname: "Doe",
    email: "john.doe@example.com",
    phone: "85512345678",
    return_url: Buffer.from(
      "https://yourwebsite.com/payment-callback"
    ).toString("base64"),
    continue_success_url: "https://yourwebsite.com/add-card-success",
  };

  // Generate hash string
  const hashString = `${requestData.merchant_id}${requestData.ctid}${requestData.return_param}`;
  const hash = crypto
    .createHmac("sha512", PUBLIC_KEY)
    .update(hashString)
    .digest("base64");

  // Add the generated hash to the request data
  requestData.hash = hash;

  try {
    // Send request to PayWay
    const response = await axios.post(PAYWAY_COF_URL, requestData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("Response from PayWay:", response.data); // Log the response data
    res.send(response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error calling PayWay API");
  }
});

// Proxy endpoint for fetching resources
app.get("/_nuxt/:file", async (req, res) => {
  const file = req.params.file;
  try {
    const response = await axios.get(
      `https://checkout-sandbox.payway.com.kh/_nuxt/${file}`,
      {
        responseType: "stream",
      }
    );
    res.set("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);
  } catch (error) {
    res.status(404).send("File not found");
  }
});

// Serve the frontend HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
