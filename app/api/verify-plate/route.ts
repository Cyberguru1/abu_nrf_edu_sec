import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { NextResponse } from 'next/server';

interface VerifyPlateRequestBody {
    plateNumber: string;
}

interface VerifyPlateResponse {
    message?: string;
    data?: { vehicleMake: string; vehicleColor: string };
    error?: string;
}

export async function POST(req: Request, res: NextApiResponse<VerifyPlateResponse>) {

    const body = await req.json();


    const { plateNumber } = body as VerifyPlateRequestBody;

    if (!plateNumber || typeof plateNumber !== 'string') {
        return NextResponse.json({ error: 'Plate number is required and must be a string' }, {status: 400});
    }

    try {
        // Step 1: Fetch the form page to get the CSRF token and cookies
        const formResponse = await axios.get('https://nvis.frsc.gov.ng/vehiclemanagement/VerifyPlateNo/d', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
                'Accept-Language': 'en-NG,en;q=0.8,en-US;q=0.5,en;q=0.3',
            },
        });

        // Parse the HTML to extract the CSRF token
        const formDom = new JSDOM(formResponse.data);
        const tokenInput = formDom.window.document.querySelector('input[name="__RequestVerificationToken"]');
        const requestVerificationToken = tokenInput?.getAttribute('value') || '';

        // if (!requestVerificationToken) {
        //     return res.status(500).json({ error: 'Failed to retrieve CSRF token' });
        // }

        // Extract cookies from the response
        const cookies = formResponse.headers['set-cookie'] || [];

        // Step 2: Send the plate number verification request
        const verifyResponse = await axios.post(
            'https://nvis.frsc.gov.ng/vehiclemanagement/VerifyPlateNo/d',
            new URLSearchParams({
                plateNumber,
                __RequestVerificationToken: requestVerificationToken,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
                    'Accept-Language': 'en-NG,en;q=0.8,en-US;q=0.5,en;q=0.3',
                    'Origin': 'https://nvis.frsc.gov.ng',
                    'Referer': 'https://nvis.frsc.gov.ng/vehiclemanagement/VerifyPlateNo/d',
                    'Cookie': cookies.join('; '),
                },
            }
        );

        // Parse the HTML response
        const dom = new JSDOM(verifyResponse.data);
        const document = dom.window.document;

        // Check for failure response by looking for showAlert('error', ...)
        const scripts = document.querySelectorAll('script');
        let errorMessage: string | null = null;
        for (const script of scripts) {
            const scriptContent = script.textContent || '';
            const errorMatch = scriptContent.match(/showAlert\('error',\s*'[^']*',\s*'([^']*)'/);
            if (errorMatch) {
                errorMessage = errorMatch[1]; // e.g., "Invalid plate number"
                break;
            }
        }

        if (errorMessage) {
            return NextResponse.json({ error: errorMessage}, { status: 400 });
        }

        // Check for success response by extracting Vehicle Make and Vehicle Color
        const table = document.querySelector('.panel-body table');
        if (!table) {
            return NextResponse.json({ message: 'No vehicle data found in response' }, {status: 200});
        }

        const rows = table.querySelectorAll('tr');
        let vehicleMake = '';
        let vehicleColor = '';

        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const label = cells[0].textContent?.trim().toLowerCase();
                const value = cells[1].querySelector('span')?.textContent?.trim() || '';
                if (label?.includes('vehicle make')) {
                    vehicleMake = value;
                } else if (label?.includes('vehicle color')) {
                    vehicleColor = value;
                }
            }
        }

        return NextResponse.json({
            message: 'Plate number verified successfully',
            data: {
                vehicleMake,
                vehicleColor,
            },
        }, {status: 200})
    } catch (error) {
        console.error('Verify plate number error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: errorMessage });
    }
}