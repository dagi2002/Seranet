import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../lib/utils";
import { create } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, ArrowRight, ArrowLeft, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading] = useState(false); // upload disabled in JSON version

  const [formData, setFormData] = useState({
    business_name: "",
    owner_name: "",
    phone: "",
    store_url_slug: "",
    description: "",
    logo_url: "" // we won't upload, but leave field
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "business_name" && !prev.store_url_slug
        ? { store_url_slug: value.toLowerCase().replace(/[^a-z0-9]/g, "") }
        : {})
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    await create("merchants", formData);

    setLoading(false);
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Seranet
            </span>
          </div>
          <p className="text-slate-600">Create your online store in 2 minutes</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-teal-600"
                  : s < step
                  ? "w-8 bg-teal-400"
                  : "w-8 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Step Card */}
        <Card className="border-0 shadow-xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Tell us about your business</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <Label>Business Name</Label>
                    <Input
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      placeholder="e.g., EthoClothes"
                    />
                  </div>

                  <div>
                    <Label>Your Name</Label>
                    <Input name="owner_name" value={formData.owner_name} onChange={handleInputChange} placeholder="e.g., Abebe Kebede" />
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="0912345678" />
                  </div>

                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => setStep(2)}
                    disabled={!formData.business_name || !formData.phone}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CardHeader>
                  <CardTitle>Store Details</CardTitle>
                  <CardDescription>Customize your store</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <Label>Store URL</Label>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-slate-500 bg-slate-100 px-3 py-2 rounded-l-md border">
                        seranet.et/
                      </span>
                      <Input
                        name="store_url_slug"
                        value={formData.store_url_slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            store_url_slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
                          }))
                        }
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      onClick={() => setStep(3)}
                      disabled={!formData.store_url_slug}
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}

            {/* STEP 3 – JSON server version removes upload */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CardHeader>
                  <CardTitle>Logo (Optional)</CardTitle>
                  <CardDescription>You can upload once real backend exists</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">

                  <div className="bg-slate-100 border border-slate-300 rounded-xl p-6 text-center">
                    <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-sm text-slate-500 mt-3">Logo upload disabled in local mode</p>
                  </div>

                  <div className="bg-teal-50 rounded-xl p-4">
                    <h4 className="font-medium text-teal-900 mb-2">Ready to launch!</h4>
                    <p className="text-sm text-teal-700">
                      Your store <strong>{formData.business_name}</strong> will be available at seranet.et/{formData.store_url_slug}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    <Button className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={handleSubmit} disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                        </>
                      ) : (
                        <>
                          Create Store <CheckCircle2 className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
