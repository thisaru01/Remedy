import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth/useAuth";
import { updateMe } from "@/api/services/userService";
import { changeMyPassword } from "@/api/services/authService";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function AdminProfile() {
  const { user, setToken } = useAuth();

  const [accountSubmitting, setAccountSubmitting] = useState(false);
  const [accountError, setAccountError] = useState(null);

  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    setAccountName(user?.name || "");
    setAccountEmail(user?.email || "");
  }, [user?.name, user?.email]);

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

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your admin account and security.
        </p>
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
    </div>
  );
}
