"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Upload, Download, Sun, Moon, ArrowLeft } from "lucide-react";
import axios from "axios";

const Component = () => {
  const [currentPage, setCurrentPage] = useState("main");
  const [action, setAction] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAlert = (message) => {
    alert(message);
  };

  const handleSubmit = async (data) => {
    console.log(data);
    setLoading(true);

    try {
      const response = await axios.post(
        "https://ehomeiot.vercel.app/api/add-device",
        data
      );
      console.log("add-device", response.data);

      if (response.status === 201) {
        showAlert("Data uploaded successfully!");
        setCurrentPage("main");
      }
    } catch (error) {
      // Log the full error for debugging
      console.error("Error during upload:", error);

      // Handle specific backend error response
      if (error.response && error.response.status === 400) {
        const backendError = error.response.data?.error;

        // Show specific error message if provided
        if (backendError === "Device with MAC address 'abc' already exists") {
          showAlert(
            "Upload failed: A device with this MAC address already exists. Please check the MAC address and try again."
          );
        } else {
          // Generic error message for other 400 errors
          showAlert("An error occurred: " + backendError || "Bad Request");
        }
      } else {
        // Fallback for other types of errors
        showAlert("An unexpected error occurred during upload.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (data) => {
    console.log(data);
    setLoading(true);
    try {
      const response = await axios.get(
        "https://ehomeiot.vercel.app/api/search",
        { params: data }
      );
      console.log(response.data, "api/search");
      if (response.status === 200) {
        const { downloadUrl } = response.data;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", "search_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showAlert("Download complete");
        setCurrentPage("main");
      }
    } catch (error) {
      console.error("Error fetching download URL:", error);
      showAlert("An error occurred while fetching the download URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentPage("main");
    setAction(null);
  };

  if (!mounted) return null;

  return (
    <ThemeProvider attribute="class">
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <ThemeToggle />
        {currentPage !== "main" && <BackButton onBack={handleBack} />}
        {currentPage === "main" ? (
          <MainPage setCurrentPage={setCurrentPage} setAction={setAction} />
        ) : (
          <DataPage
            action={action}
            onSubmit={handleSubmit}
            onDownload={handleDownload}
            loading={loading}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 right-4"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const BackButton = ({ onBack }) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 left-4"
      onClick={onBack}
    >
      <ArrowLeft className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Go back</span>
    </Button>
  );
};

const MainPage = ({ setCurrentPage, setAction }) => {
  return (
    <div className="space-y-4">
      <Button
        onClick={() => {
          setCurrentPage("data");
          setAction("upload");
        }}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" /> Upload Data
      </Button>
      <Button
        onClick={() => {
          setCurrentPage("data");
          setAction("download");
        }}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" /> Download CSV
      </Button>
    </div>
  );
};

const DataPage = ({ action, onSubmit, onDownload, loading }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    ehomeModel: "",
    vendorModel: "",
    item: "",
    macAddress: "",
    hwSn: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAction = () => {
    if (action === "upload") {
      onSubmit(formData);
    } else if (action === "download") {
      onDownload(formData);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {[
        "companyName",
        "ehomeModel",
        "vendorModel",
        "item",
        "macAddress",
        "hwSn",
      ].map((field) => (
        <input
          key={field}
          className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder={field.replace(/([A-Z])/g, " $1").trim()}
          name={field}
          value={formData[field]}
          onChange={handleChange}
        />
      ))}
      <Button onClick={handleAction} className="w-full" disabled={loading}>
        {action === "upload" ? (
          <>
            <Upload className="mr-2 h-4 w-4" />{" "}
            {loading ? "Submitting..." : "Submit"}
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />{" "}
            {loading ? "Downloading..." : "Download"}
          </>
        )}
      </Button>
    </div>
  );
};

export default Component;
