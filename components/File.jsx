"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import axios from "axios";
import { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function Component() {
  const companyRef = useRef(null);
  const ehomeRef = useRef(null);
  const vendorRef = useRef(null);
  const itemRef = useRef(null);
  const macRef = useRef(null);
  const hwsnRef = useRef(null);

  const inputRefs = [companyRef, ehomeRef, vendorRef, itemRef, macRef, hwsnRef];
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < inputRefs.length) {
        inputRefs[nextIndex].current?.focus();
      } else {
        handleSubmit(e);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await triggerSearch();
  };

  const triggerSearch = async () => {
    const params = {
      companyName: companyRef.current?.value || "",
      ehomeModel: ehomeRef.current?.value || "",
      vendorModel: vendorRef.current?.value || "",
      item: itemRef.current?.value || "",
      macAddress: macRef.current?.value || "",
      hwSn: hwsnRef.current?.value || "",
    };

    try {
      const response = await axios.get(
        "https://ehomeiot.vercel.app/api/search",
        { params }
      );
      if (response.status === 200) {
        alert("Search completed successfully!");
      }
    } catch (error) {
      console.error("Error during search:", error);
      alert("An error occurred during search.");
    }
  };

  const triggerUpload = async () => {
    const data = {
      companyName: companyRef.current?.value || "",
      ehomeModel: ehomeRef.current?.value || "",
      vendorModel: vendorRef.current?.value || "",
      item: itemRef.current?.value || "",
      macAddress: macRef.current?.value || "",
      hwSn: hwsnRef.current?.value || "",
    };

    try {
      const response = await axios.post(
        "https://ehomeiot.vercel.app/api/devices",
        data
      );
      console.log(response.data, "api/devices");
      if (response.status === 201) {
        alert("Data uploaded successfully!");
        // Download CSV after upload success
        await triggerSearchAndDownload();
      }
    } catch (error) {
      console.error("Error during upload:", error);
      alert("An error occurred during upload.");
    }
  };

  const triggerSearchAndDownload = async () => {
    const params = {
      companyName: companyRef.current?.value || "",
      ehomeModel: ehomeRef.current?.value || "",
      vendorModel: vendorRef.current?.value || "",
      item: itemRef.current?.value || "",
      macAddress: macRef.current?.value || "",
      hwSn: hwsnRef.current?.value || "",
    };

    try {
      const response = await axios.get(
        "https://ehomeiot.vercel.app/api/search",
        { params }
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
      }
    } catch (error) {
      console.error("Error fetching download URL:", error);
      alert("An error occurred while fetching the download URL.");
    }
  };

  const handleDropdownSelect = async (action) => {
    if (action === "Download CSV") {
      await triggerSearch();
    } else if (action === "Upload Data") {
      await triggerUpload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6 flex items-center justify-center flex-col space-y-6">
      {/* Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-white text-purple-600 hover:bg-purple-500 hover:text-white">
            Select Download or Upload data
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => handleDropdownSelect("Download CSV")}
          >
            Download CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDropdownSelect("Upload Data")}>
            Upload Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Card */}
      <div className="w-full max-w-4xl bg-white bg-opacity-20 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden transform perspective-1000 hover:scale-105 transition-all duration-300">
        <div className="p-8 space-y-8">
          {/* Logo */}
          <div className="w-48 mx-auto mb-8 transform hover:scale-110 transition-transform duration-300">
            <Image
              src="/imp.jpeg"
              alt="e Hoome IoT smart living"
              width={200}
              height={80}
              priority
              className="h-auto w-full"
            />
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { label: "Company name", ref: companyRef, index: 0 },
                { label: "Ehome Model", ref: ehomeRef, index: 1 },
                { label: "Vendor Model", ref: vendorRef, index: 2 },
                { label: "Item", ref: itemRef, index: 3 },
                { label: "MAC address", ref: macRef, index: 4 },
                { label: "HW/SN", ref: hwsnRef, index: 5 },
              ].map((field) => (
                <div key={field.label} className="space-y-2">
                  <label
                    htmlFor={field.label.toLowerCase().replace(" ", "-")}
                    className="text-lg font-semibold text-white"
                  >
                    {field.label}
                  </label>
                  <div className="relative">
                    <Input
                      id={field.label.toLowerCase().replace(" ", "-")}
                      ref={field.ref}
                      className="h-12 bg-white bg-opacity-20 border-4 border-white border-opacity-50 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:border-opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      required
                      onKeyDown={(e) => handleKeyDown(e, field.index)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg font-bold rounded-lg transform hover:scale-105 hover:shadow-xl transition-all duration-300 border-4 border-white border-opacity-50 hover:border-opacity-100"
            >
              Submit
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
