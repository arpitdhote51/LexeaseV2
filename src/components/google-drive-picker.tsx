
"use client";

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const GOOGLE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "";

interface GoogleDrivePickerProps {
    onFilePicked: (file: File) => void;
}

const GoogleDrivePicker = ({ onFilePicked }: GoogleDrivePickerProps) => {
    const { toast } = useToast();
    const [gapiLoaded, setGapiLoaded] = useState(false);
    const [gisLoaded, setGisLoaded] = useState(false);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = () => {
            window.gapi.load('client:picker', () => {
                setGapiLoaded(true);
            });
        };
        document.body.appendChild(gapiScript);

        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = () => {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_APP_ID,
                scope: 'https://www.googleapis.com/auth/drive.readonly',
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        createPicker(tokenResponse.access_token);
                    } else {
                        setIsLoading(false);
                    }
                },
            });
            setTokenClient(client);
            setGisLoaded(true);
        };
        document.body.appendChild(gisScript);

        return () => {
            document.body.removeChild(gapiScript);
            document.body.removeChild(gisScript);
        }
    }, []);

    const handleAuthClick = () => {
        setIsLoading(true);
        if (tokenClient) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Google authentication is not ready.',
            });
            setIsLoading(false);
        }
    };
    
    const createPicker = (accessToken: string) => {
        const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        view.setMimeTypes("application/vnd.google-apps.document,application/pdf,text/plain");

        const picker = new window.google.picker.PickerBuilder()
            .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
            .setAppId(GOOGLE_APP_ID)
            .setOAuthToken(accessToken)
            .addView(view)
            .setCallback((data: any) => {
                if (data[window.google.picker.Action.PICKED]) {
                    const doc = data[window.google.picker.Action.PICKED][0];
                    downloadDriveFile(doc.id, doc.name, accessToken, doc.mimeType);
                } else if (data[window.google.picker.Action.CANCEL]) {
                    setIsLoading(false);
                }
            })
            .build();
        picker.setVisible(true);
    };

    const downloadDriveFile = async (fileId: string, fileName: string, accessToken: string, mimeType: string) => {
        let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        let asMimeType = "text/plain";

        if(mimeType === 'application/vnd.google-apps.document'){
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`;
            asMimeType = "text/plain";
            fileName = `${fileName}.txt`;
        } else if (mimeType === 'application/pdf') {
            asMimeType = "application/pdf";
        } else { // text/plain
             asMimeType = "text/plain";
        }

        try {
            const response = await fetch(downloadUrl, {
                headers: new Headers({ 'Authorization': `Bearer ${accessToken}` })
            });

            if (!response.ok) {
                throw new Error(`Failed to download file: ${response.statusText}`);
            }

            const blob = await response.blob();
            const file = new File([blob], fileName, { type: asMimeType });
            onFilePicked(file);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Google Drive Error',
                description: `Could not download the file. ${error.message}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const bothLoaded = gapiLoaded && gisLoaded;

    return (
        <Button 
            onClick={handleAuthClick}
            disabled={!bothLoaded || isLoading}
            variant="outline"
            className="w-full"
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
             <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.70999 15.75L3.93999 22.28L6.76999 22.28L10.53 15.75H7.69999L7.70999 15.75Z" fill="#34A853"/>
                <path d="M10.5401 15.75L12.0001 13.12L13.4601 15.75H10.5401Z" fill="#EA4335"/>
                <path d="M16.29 15.75H20.06L17.23 22.28H13.46L16.29 15.75Z" fill="#4285F4"/>
                <path d="M17.23 1.71997H6.76998L1.76999 10.5L6.76998 19.28H17.23L22.23 10.5L17.23 1.71997ZM17.23 15.75H13.46L12 13.12L10.54 15.75H6.76998L3.93998 10.5L6.76998 5.25003H17.23L20.06 10.5L17.23 15.75Z" fill="#FBBC04"/>
                <path d="M6.77002 5.25003L3.94002 10.5L6.77002 15.75H10.54L12 13.12L10.54 10.5L12 7.87003L10.54 5.25003H6.77002Z" fill="#FFC107"/>
                <path d="M17.23 5.25003H13.46L12 7.87003L13.46 10.5L12 13.12L13.46 15.75H17.23L20.06 10.5L17.23 5.25003Z" fill="#4CAF50"/>
            </svg>
            }
            {isLoading ? "Loading Drive..." : "Choose from Google Drive"}
        </Button>
    );
};

export default GoogleDrivePicker;
