import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth/useAuth";
import { updateMe } from "@/api/services/userService";
import { changeMyPassword } from "@/api/services/authService";
import {
  getMyPatientProfile,
  updateMyPatientProfile,
} from "@/api/services/patientProfileService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function PatientProfile() {
  const { user, setToken } = useAuth();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profile, setProfile] = useState(null);

  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [accountError, setAccountError] = useState(null);

  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const [detailsSubmitting, setDetailsSubmitting] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");

  useEffect(() => {
    setAccountName(user?.name || "");
    setAccountEmail(user?.email || "");
  }, [user?.name, user?.email]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingProfile(true);
        setProfileError(null);
        const response = await getMyPatientProfile();
        const nextProfile = response?.data?.profile ?? response?.data ?? null;
        if (!cancelled) {
          setProfile(nextProfile);
          const dobValue = nextProfile?.dateOfBirth
            ? (() => {
                try {
                  return new Date(nextProfile.dateOfBirth)
                    .toISOString()
                    .slice(0, 10);
                } catch {
                  return "";
                }
              })()
            : "";
          setDateOfBirth(dobValue);
          setGender(nextProfile?.gender || "");
          setPhone(nextProfile?.phone || "");
          setAddress(nextProfile?.address || "");
          setMedicalHistory(nextProfile?.medicalHistory || "");
        }
      } catch (err) {
        if (!cancelled) {
          setProfileError(err?.message || "Failed to load profile");
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAccountSubmit = async (event) => {
    event.preventDefault();
    setAccountError(null);

    const payload = {
      name: accountName.trim(),
      email: accountEmail.trim(),
    };

    try {
      setAccountSubmitting(true);
      const response = await updateMe(payload);
      const data = response?.data;
      if (data?.token) {
        setToken(data.token);
      }
      toast.success(data?.message || "Account details updated");
    } catch (err) {
      const message = err?.message || "Failed to update account details";
      setAccountError(message);
      toast.error(message);
    } finally {
      setAccountSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword) {
      setPasswordError("Current and new password are required");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }

    try {
      setPasswordSubmitting(true);
      const response = await changeMyPassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      const data = response?.data;
      if (data?.token) {
        setToken(data.token);
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success(data?.message || "Password updated successfully");
    } catch (err) {
      const message = err?.message || "Failed to update password";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleDetailsSubmit = async (event) => {
    event.preventDefault();
    setDetailsError(null);

    // Basic client-side Sri Lankan phone validation to match backend rules.
    if (phone) {
      const normalized = phone.trim().replace(/[\s()-]/g, "");
      const isLocal = /^0\d{9}$/.test(normalized);
      const isPlus94 = /^\+94\d{9}$/.test(normalized);
      const is94 = /^94\d{9}$/.test(normalized);

      if (!isLocal && !isPlus94 && !is94) {
        setDetailsError(
          "Phone must be a valid Sri Lankan number (e.g. 0771234567 or +94771234567)",
        );
        return;
      }
    }

    const payload = {};
    if (dateOfBirth) payload.dateOfBirth = dateOfBirth;
    if (gender) payload.gender = gender;
    if (phone !== "") payload.phone = phone;
    if (address !== "") payload.address = address;
    if (medicalHistory !== "") payload.medicalHistory = medicalHistory;

    try {
      setDetailsSubmitting(true);
      const response = await updateMyPatientProfile(payload);
      const data = response?.data;
      const nextProfile = data?.profile ?? data ?? null;
      setProfile(nextProfile);
      toast.success(data?.message || "Patient details updated");
    } catch (err) {
      const message = err?.message || "Failed to update patient details";
      setDetailsError(message);
      toast.error(message);
    } finally {
      setDetailsSubmitting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, security, and personal health details.
        </p>
        {profileError && (
          <p className="text-xs text-destructive mt-1">{profileError}</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Full name</FieldLabel>
                  <Input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </Field>
                <Field>
                  <FieldLabel>Email address</FieldLabel>
                  <Input
                    type="email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>
                {accountError && (
                  <FieldDescription className="text-destructive">
                    {accountError}
                  </FieldDescription>
                )}
              </FieldGroup>
              <div className="flex justify-end">
                <Button type="submit" disabled={accountSubmitting}>
                  {accountSubmitting ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Current password</FieldLabel>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </Field>
                <Field>
                  <FieldLabel>New password</FieldLabel>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <FieldDescription>
                    Must be at least 8 characters and include a letter, a
                    number, and a special character.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Confirm new password</FieldLabel>
                  <Input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </Field>
                {passwordError && (
                  <FieldDescription className="text-destructive">
                    {passwordError}
                  </FieldDescription>
                )}
              </FieldGroup>
              <div className="flex justify-end">
                <Button type="submit" disabled={passwordSubmitting}>
                  {passwordSubmitting ? "Updating..." : "Update password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Date of birth</FieldLabel>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel>Gender</FieldLabel>
                  <Select
                    value={gender || undefined}
                    onValueChange={(value) => setGender(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field>
                <FieldLabel>Phone number</FieldLabel>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0771234567 or +94771234567"
                  inputMode="numeric"
                />
                <FieldDescription>
                  Sri Lankan numbers only. Use 0XXXXXXXXX or +94XXXXXXXXX.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Address</FieldLabel>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, country"
                  rows={3}
                />
              </Field>

              <Field>
                <FieldLabel>Medical history</FieldLabel>
                <Textarea
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Allergies, chronic conditions, medications, or other relevant notes."
                  rows={4}
                />
              </Field>

              {detailsError && (
                <FieldDescription className="text-destructive">
                  {detailsError}
                </FieldDescription>
              )}
            </FieldGroup>

            <div className="flex justify-end">
              <Button type="submit" disabled={detailsSubmitting}>
                {detailsSubmitting ? "Saving..." : "Save patient details"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
