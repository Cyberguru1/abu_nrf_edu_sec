interface VerifyPlateResponse {
    message?: string;
    data?: { vehicleMake: string; vehicleColor: string };
    error?: string;
}

export async function verifyVehiclePlate(plateNumber: string): Promise<VerifyPlateResponse> {
    try {
        const response = await fetch('/api/verify-plate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plateNumber }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'Failed to verify plate number' };
        }

        return data;
    } catch (error) {
        console.error('Verify plate number error:', error);
        return { error: error instanceof Error ? error.message : 'Network error' };
    }
};