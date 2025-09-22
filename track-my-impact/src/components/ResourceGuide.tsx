/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

ResourceGuide.tsx: Curated Johannesburg resource compendium supporting sustainable actions.
*/
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BookOpen,
  Phone,
  Recycle,
  AlertTriangle,
  Info
} from "lucide-react";

export default function ResourceGuide() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Johannesburg Resource Guide</h2>
        <p className="text-gray-600">
          Learn how to manage your waste responsibly. Find recycling centres, disposal guidance,
          and municipal services across Johannesburg.
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recycling Centres */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Recycle className="h-5 w-5" />
              Recycling Centres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Find local collection points and recycling facilities
            </p>
            <div className="w-full h-64">
              <iframe
                src="https://sstafrica.org.za/my_map/index_waste_recycle.html"
                width="100%"
                height="100%"
                className="rounded-md border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Municipal Services */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Phone className="h-5 w-5" />
              Municipal Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Contact Johannesburg’s official waste management service.
            </p>
            <ul className="text-sm space-y-2 text-gray-700">
              <li>
                <strong>Provider:</strong>{" "}
                <a href="https://www.pikitup.co.za" target="_blank" className="text-blue-600 underline">
                  Pikitup
                </a>
              </li>
              <li>
                <a
                  href="https://pikitup.co.za/contacts/"
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Full Pikitup Contact List
                </a>
              </li>
              <li><strong>Head Office:</strong> (011) 712-5200</li>
              <li><strong>Joburg Connect (Call Centre):</strong> 086 056 2874</li>
              <li><strong>Illegal Dumping WhatsApp:</strong> 082 779 1361</li>
              <li><strong>Illegal Dumping Hotline:</strong> 080 872 3342</li>
              <li>
                <strong>Suggestions / Compliments:</strong>{" "}
                <a href="mailto:info@pikitup.co.za" className="text-blue-600 underline">info@pikitup.co.za</a>{" "}
                /{" "}
                <a href="mailto:muzimkhwanazi@pikitup.co.za" className="text-blue-600 underline">muzimkhwanazi@pikitup.co.za</a>
              </li>
              <li><strong>Pikitup Call Centre:</strong> 010 055 5990 / 087 357 1068</li>
            </ul>
          </CardContent>
        </Card>

        {/* Emergency Disposal */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Emergency Disposal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Hazardous waste requires safe disposal. Never put batteries, bulbs, medicines, or
              chemicals in your bin.
            </p>
            <p className="text-sm text-gray-700">
              <a href="https://www.iwmsa.co.za/resources/faq-hazardous-waste" target="_blank" className="text-blue-600 underline">
                IWMSA Hazardous Waste Guidance
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Waste Hierarchy & Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-green-600" />
            Waste Hierarchy & Policy in South Africa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" className="w-full">
            <AccordionItem value="hierarchy">
              <AccordionTrigger>Waste Hierarchy</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600">
                  The waste hierarchy ranks options: <strong>Prevent</strong> waste first,
                  then <strong>Reduce</strong>, <strong>Reuse</strong>, <strong>Recycle</strong>,
                  with <strong>Treatment</strong> and <strong>Landfill</strong> as last resorts.{" "}
                  Source:{" "}
                  <a href="https://www.iwmsa.co.za/resources/activities" target="_blank" className="text-blue-600 underline">IWMSA</a>.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="policy">
              <AccordionTrigger>Policy Timeline</AccordionTrigger>
              <AccordionContent>
                <ul className="text-sm text-gray-600 list-disc ml-4 space-y-1">
                  <li><strong>2008:</strong> National Environmental Management: Waste Act (NEM:WA).</li>
                  <li><strong>2011:</strong> First National Waste Management Strategy (NWMS).</li>
                  <li><strong>2020:</strong> Updated NWMS – focus on circular economy.</li>
                  <li><strong>Now:</strong> DFFE aims for 40% diversion from landfill by 2035.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="state">
              <AccordionTrigger>State of Waste in SA</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600">
                  South Africa generates about <strong>108 million tonnes</strong> of waste annually.
                  About <strong>90%</strong> goes to landfill, with recycling rates improving but still low.{" "}
                  (DFFE Environmental Outlook 2024).
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Disposal Guidance by Material */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            Material-Specific Disposal Guidance
          </CardTitle>
          <CardDescription>
            Preparation, cleaning tips, and where to recycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">

            {/* Plastics */}
            <AccordionItem value="plastics">
              <AccordionTrigger>
                Plastics <Badge className="ml-2 bg-purple-100 text-purple-800">Check Codes</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600 mb-2">
                  Rinse plastics to remove food/liquid residue. Check the resin code (usually on the bottom). 
                  Focus on PET (#1), HDPE (#2), and PP (#5).
                </p>
                <ul className="text-sm space-y-1">
                  <li><strong>PET (#1):</strong> Soft drink & water bottles (widely recycled). <a href="https://petco.co.za" target="_blank" className="text-blue-600 underline">PETCO</a>.</li>
                  <li><strong>HDPE (#2):</strong> Milk jugs, detergent bottles. <a href="https://polyco.co.za" target="_blank" className="text-blue-600 underline">Polyco</a>.</li>
                  <li><strong>PP (#5):</strong> Yogurt tubs, straws (select facilities). <a href="https://polyco.co.za" target="_blank" className="text-blue-600 underline">Polyco</a>.</li>
                  <li><strong>LDPE (#4):</strong> Plastic bags, film (retail take-back). </li>
                  <li><strong>PVC (#3) & PS (#6):</strong> Limited recycling options. </li>
                  <li><strong>Other (#7):</strong> Mixed plastics, least recyclable. </li>
                </ul>
                <p className="mt-2 text-xs text-gray-600">
                  Source:{" "}
                  <a href="https://postwink.co.za/know-your-plastics-differentiating-between-the-7-main-types-of-plastics/"
                     target="_blank"
                     className="text-blue-600 underline">
                    Postwink – Know Your Plastics
                  </a>
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Metals */}
            <AccordionItem value="metals">
              <AccordionTrigger>
                Metals <Badge className="ml-2 bg-orange-100 text-orange-800">Cash Value</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600 mb-2">Aluminium and steel cans are valuable recyclables.</p>
                <ul className="text-sm space-y-1">
                  <li><strong>Aluminium Cans:</strong> Accepted by <a href="https://collectacan.co.za" target="_blank" className="text-blue-600">Collect-a-Can</a>.</li>
                  <li><strong>Steel Cans:</strong> Recyclable; separate with a magnet.</li>
                  <li><strong>Foil & Trays:</strong> Clean before recycling.</li>
                  <li><strong>Aerosols:</strong> Treat as hazardous if not empty.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Organics */}
            <AccordionItem value="organics">
              <AccordionTrigger>
                Organics <Badge className="ml-2 bg-emerald-100 text-emerald-800">Compostable</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600 mb-2">Composting reduces methane emissions and enriches soil.</p>
                <ul className="text-sm space-y-1">
                  <li><strong>Food Waste:</strong> Compost at home, or use bokashi/worm bins.</li>
                  <li><strong>Garden Waste:</strong> Many municipalities collect for chipping/composting.</li>
                  <li><strong>Partners:</strong> IWMSA, local community gardens.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Textiles */}
            <AccordionItem value="textiles">
              <AccordionTrigger>
                Textiles <Badge className="ml-2 bg-pink-100 text-pink-800">Donate/Reuse</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600 mb-2">Clothing and shoes are best reused or donated.</p>
                <ul className="text-sm space-y-1">
                  <li><strong>Clothing:</strong> Donate to The Clothing Bank or charities.</li>
                  <li><strong>Shoes:</strong> Reuse or donate; limited recycling options.</li>
                  <li><strong>Linens:</strong> Repurpose as rags or donate.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Hazardous & E-waste */}
            <AccordionItem value="hazardous">
              <AccordionTrigger>
                Hazardous & E-waste <Badge className="ml-2 bg-red-100 text-red-800">Special Care</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600 mb-2">
                  These items must never go into general bins.
                </p>
                <ul className="text-sm space-y-1">
                  <li><strong>Batteries & Bulbs:</strong> Drop at retailers or hazardous depots.</li>
                  <li><strong>Medicines:</strong> Return to pharmacies for safe disposal.</li>
                  <li><strong>Electronics:</strong> Use e-waste collection points (eWASA).</li>
                  <li><strong>Paints/Chemicals:</strong> Take to municipal hazardous facilities.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
