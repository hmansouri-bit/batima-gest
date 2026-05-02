/**
 * Generates an image URL that goes through our API proxy
 * This ensures proper CORS headers and authentication handling
 */
export function getImageUrl(bucket: string, path: string): string {
    const params = new URLSearchParams({
        bucket,
        path,
    });
    return `/api/image?${params.toString()}`;
}

/**
 * Generates an image URL from a stored path (assumes bucket is 'signalement-photos')
 */
export function getSignalementImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    // If it's already a full URL or proxy URL, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('/api/')) {
        return imagePath;
    }
    return getImageUrl('signalement-photos', imagePath);
}
