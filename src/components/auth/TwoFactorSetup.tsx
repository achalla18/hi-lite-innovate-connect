import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Smartphone, Key } from "lucide-react";

export default function TwoFactorSetup() {
  const { user } = useAuth();
  const [isEnabling, setIsEnabling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [secret, setSecret] = useState<string | null>(null);

  const handleEnable2FA = async () => {
    setIsEnabling(true);
    
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      if (error) throw error;
      
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      
    } catch (error: any) {
      toast.error(`Failed to setup 2FA: ${error.message}`);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || !secret) return;
    
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: secret,
        code: verificationCode
      });
      
      if (error) throw error;
      
      toast.success("Two-factor authentication enabled successfully!");
      setQrCode(null);
      setSecret(null);
      setVerificationCode("");
      
    } catch (error: any) {
      toast.error(`Verification failed: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with 2FA
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!qrCode ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Smartphone className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">Authenticator App</h3>
                <p className="text-sm text-muted-foreground">
                  Use Google Authenticator, Authy, or similar apps
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleEnable2FA}
              disabled={isEnabling}
              className="w-full"
            >
              {isEnabling ? "Setting up..." : "Enable Two-Factor Authentication"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Scan QR Code</h3>
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="2FA QR Code" className="border rounded-lg" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app, then enter the verification code below.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            
            <Button 
              onClick={handleVerify2FA}
              disabled={verificationCode.length !== 6}
              className="w-full"
            >
              Verify and Enable 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}