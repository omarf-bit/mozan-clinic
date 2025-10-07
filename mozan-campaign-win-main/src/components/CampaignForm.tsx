import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { insertLead, checkDuplicate } from "@/lib/database";

const formSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phoneNumber: z.string().trim().regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number").min(8, "Phone number must be at least 8 digits").max(20),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  institution: z.string().trim().min(2, "Institution is required").max(200),
  occupation: z.string().min(1, "Please select an occupation"),
});

type FormData = z.infer<typeof formSchema>;

interface CampaignFormProps {
  onSuccess: () => void;
}

export const CampaignForm = ({ onSuccess }: CampaignFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const occupation = watch("occupation");

  const onSubmit = async (data: FormData) => {
    try {
      setDuplicateError(null);
      
      // Check for duplicates
      const duplicateCheck = await checkDuplicate(data.email, data.phoneNumber);
      
      if (duplicateCheck.isDuplicate) {
        if (duplicateCheck.field === 'email') {
          setDuplicateError('This email has already been registered. If you believe this is an error, please contact us.');
        } else if (duplicateCheck.field === 'phone') {
          setDuplicateError('This phone number has already been registered. If you believe this is an error, please contact us.');
        }
        return;
      }
      
      // Save to SQLite database
      await insertLead({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        institution: data.institution,
        occupation: data.occupation,
      });

      setIsSubmitted(true);
      
      // Redirect to Instagram after 2 seconds
      setTimeout(() => {
        window.location.href = "https://www.instagram.com/mozanclinic/?hl=en";
      }, 2000);
      
      onSuccess();
    } catch (error) {
      console.error("Error saving form data:", error);
      setDuplicateError("There was an error saving your information. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-8 text-center space-y-4 bg-card border-border">
        <CheckCircle2 className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-2xl font-semibold text-foreground">Thank You!</h2>
        <p className="text-muted-foreground">
          Your discount has been registered. Redirecting you to our Instagram...
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-card border-border">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {duplicateError && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">{duplicateError}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder="Enter your full name"
            className="bg-background border-input"
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            type="tel"
            {...register("phoneNumber")}
            placeholder="Enter your phone number"
            className="bg-background border-input"
            onInput={(e) => {
              const input = e.target as HTMLInputElement;
              input.value = input.value.replace(/[^0-9+\-\s()]/g, '');
            }}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="Enter your email address"
            className="bg-background border-input"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution">Institution *</Label>
          <Input
            id="institution"
            {...register("institution")}
            placeholder="Where you work or study"
            className="bg-background border-input"
          />
          {errors.institution && (
            <p className="text-sm text-destructive">{errors.institution.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Occupation *</Label>
          <Select
            value={occupation}
            onValueChange={(value) => setValue("occupation", value)}
          >
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="Select your occupation" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50 max-h-[300px]">
              <SelectItem value="Accountant">Accountant</SelectItem>
              <SelectItem value="Administrative Assistant">Administrative Assistant</SelectItem>
              <SelectItem value="Architect">Architect</SelectItem>
              <SelectItem value="Artist">Artist</SelectItem>
              <SelectItem value="Business Owner">Business Owner</SelectItem>
              <SelectItem value="Chef/Cook">Chef/Cook</SelectItem>
              <SelectItem value="Consultant">Consultant</SelectItem>
              <SelectItem value="Customer Service">Customer Service</SelectItem>
              <SelectItem value="Dentist">Dentist</SelectItem>
              <SelectItem value="Designer">Designer</SelectItem>
              <SelectItem value="Doctor">Doctor</SelectItem>
              <SelectItem value="Engineer">Engineer</SelectItem>
              <SelectItem value="Financial Advisor">Financial Advisor</SelectItem>
              <SelectItem value="Freelancer">Freelancer</SelectItem>
              <SelectItem value="HR Professional">HR Professional</SelectItem>
              <SelectItem value="Journalist/Writer">Journalist/Writer</SelectItem>
              <SelectItem value="Lawyer">Lawyer</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Marketing Professional">Marketing Professional</SelectItem>
              <SelectItem value="Nurse">Nurse</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="Pharmacist">Pharmacist</SelectItem>
              <SelectItem value="Photographer">Photographer</SelectItem>
              <SelectItem value="Real Estate Agent">Real Estate Agent</SelectItem>
              <SelectItem value="Retail Worker">Retail Worker</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
              <SelectItem value="Sales Representative">Sales Representative</SelectItem>
              <SelectItem value="Software Developer">Software Developer</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Teacher/Educator">Teacher/Educator</SelectItem>
              <SelectItem value="Therapist/Counselor">Therapist/Counselor</SelectItem>
            </SelectContent>
          </Select>
          {errors.occupation && (
            <p className="text-sm text-destructive">{errors.occupation.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </Card>
  );
};
