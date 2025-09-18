"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BookOpen,
  MapPin,
  Phone,
  ExternalLink,
  Recycle,
  Leaf,
  Droplets,
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

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Phone className="h-5 w-5" />
              Municipal Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Contact local waste management services
            </p>
        <strong>Johannesburg:</strong>{" "}
        <a
          href="https://www.pikitup.co.za"
          target="_blank"
          className="text-blue-600"
        >
          Pikitup
        </a>
        <ul className="ml-4 mt-1 space-y-1 text-xs text-gray-700">
            <a
              href="https://pikitup.co.za/contacts/"
              target="_blank"
              className="text-blue-600 underline"
            >
              Pikitup Contacts List
            </a>
          <li>
            <strong>Head Office:</strong> (011) 712-5200
          </li>
          <li>
            <strong>Joburg Connect (Call Centre):</strong> 086 056 2874
          </li>
          <li>
            <strong>Illegal Dumping WhatsApp:</strong> 082 779 1361
          </li>
          <li>
            <strong>Illegal Dumping Hotline:</strong> 080 872 3342
          </li>
          <li>
            <strong>Suggestions / Compliments:</strong>{" "}
            <a
              href="mailto:info@pikitup.co.za"
              className="text-blue-600 underline"
            >
              info@pikitup.co.za
            </a>{" "}
            /{" "}
            <a
              href="mailto:muzimkhwanazi@pikitup.co.za"
              className="text-blue-600 underline"
            >
              muzimkhwanazi@pikitup.co.za
            </a>
          </li>
          <li>
            <strong>Pikitup Call Centre:</strong> 010 055 5990 / 087 357 1068
          </li>
        </ul>
          </CardContent>
        </Card>

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
              <a href="https://www.iwmsa.co.za/resources/faq-hazardous-waste" target="_blank" className="text-blue-600">
                IWMSA Hazardous Waste Guidance
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Educational: Waste Hierarchy & Policy */}
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
                  with <strong>Treatment</strong> and <strong>Landfill</strong> as last resorts.
                  Source: <a href="https://www.iwmsa.co.za/resources/activities" target="_blank" className="text-blue-600">IWMSA</a>.
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
                  About <strong>90%</strong> goes to landfill, with recycling rates improving but still low.
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
            Proper disposal, preparation tips, and local recycling organisations
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
                  Plastics must be sorted by code. Focus on PET (#1), HDPE (#2), and PP (#5).
                </p>
                <ul className="text-sm space-y-1">
                  <li><strong>PET Bottles:</strong> Widely recycled. <a href="https://petco.co.za" target="_blank" className="text-blue-600">PETCO</a>.</li>
                  <li><strong>HDPE Containers:</strong> Recyclable (Polyco). <a href="https://polyco.co.za" target="_blank" className="text-blue-600">Polyco</a>.</li>
                  <li><strong>PP Containers:</strong> Common in tubs/caps. <a href="https://polyco.co.za" target="_blank" className="text-blue-600">Polyco</a>.</li>
                  <li><strong>Polystyrene (#6):</strong> Limited recycling. <a href="https://psasa.co.za" target="_blank" className="text-blue-600">PSASA</a>.</li>
                  <li><strong>Plastic Bags:</strong> Return to retail collection points.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Paper */}
            <AccordionItem value="paper">
              <AccordionTrigger>
                Paper & Cardboard <Badge className="ml-2 bg-blue-100 text-blue-800">High Value</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600 mb-2">Keep paper clean, dry, and flattened.</p>
                <ul className="text-sm space-y-1">
                  <li><strong>Newspapers & Magazines:</strong> Collected by <a href="https://www.prasa.co.za" target="_blank" className="text-blue-600">PRASA</a>.</li>
                  <li><strong>Office Paper:</strong> Recyclable via corporate collection.</li>
                  <li><strong>Cardboard:</strong> Accepted by most depots. Flatten boxes.</li>
                  <li><strong>Coffee Cups:</strong> Often lined, check before recycling.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Glass */}
            <AccordionItem value="glass">
              <AccordionTrigger>
                Glass <Badge className="ml-2 bg-green-100 text-green-800">100% Recyclable</Badge>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600 mb-2">All glass bottles and jars are recyclable.</p>
                <ul className="text-sm space-y-1">
                  <li><strong>Beverage Bottles:</strong> Returnable for cash at many outlets.</li>
                  <li><strong>Food Jars:</strong> Clean and recycle.</li>
                  <li><strong>Cosmetic Containers:</strong> Accepted in glass streams.</li>
                  <li><strong>Partners:</strong> <a href="https://www.tgrc.co.za" target="_blank" className="text-blue-600">The Glass Recycling Company</a>, Consol Glass.</li>
                </ul>
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
