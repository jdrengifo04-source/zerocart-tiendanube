import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Box, Text, Link } from "@tiendanube/nube-sdk-jsx";

/**
 * [ZeroCart] NubeSDK Checkout Extension
 * 
 * Official Entry Point: The platform expects an exported 'App' function.
 * It injects the 'nube' SDK object directly as the first argument.
 */
export function App(nube: NubeSDK) {
    console.log("[ZeroCart] 🚀 Extension initialized via official App(nube) entry point.");

    if (!nube) {
        console.error("[ZeroCart] ❌ App function called but 'nube' object is missing!");
        return;
    }

    console.log("[ZeroCart] ✅ SDK Methods available:", Object.keys(nube));

    const renderContent = async (cartId: string, storeId: string) => {
        console.log("[ZeroCart] Rendering content for ID:", cartId);

        // Show loading state
        nube.render("after_main_content", (
            <Box padding="16px" background="surfaceSecondary">
                <Text modifiers={["bold"]}>Cargando tu enlace de descarga...</Text>
            </Box>
        ));

        try {
            const url = `https://zerocart.jrengifo.com/api/order/details?cart_id=${cartId}&store_id=${storeId}`;
            console.log("[ZeroCart] Fetching from:", url);

            const response = await fetch(url);

            if (!response.ok) {
                console.error(`[ZeroCart] Fetch failed. Status: ${response.status}`);
                // If it's a 404, maybe it's not a digital product or order not yet linked
                if (response.status === 404) {
                    nube.render("after_main_content", (
                        <Box padding="16px" background="surfaceSecondary">
                            <Text>Procesando tu pedido digital... si no aparece en un momento, revisa tu email.</Text>
                        </Box>
                    ));
                    return;
                }
                throw new Error(`Failed to fetch order details. Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("[ZeroCart] Order metadata fetched successfully", data);

            if (data && data.products && data.products.length > 0) {
                nube.render("after_main_content", (
                    <Box padding="16px" background="surfaceSuccess">
                        <Text modifiers={["bold"]}>{data.config?.headline || "¡Aquí tienes tus productos digitales!"}</Text>
                        <Box margin="8px">
                            <Text>{data.config?.message || "Haz clic en el enlace de abajo para acceder a tus archivos de Google Drive asociados a esta compra."}</Text>
                        </Box>
                        {data.products.map((p: any) => (
                            <Box key={p.id} margin="8px">
                                <Link href={p.googleDriveLink} variant="primary" target="_blank">
                                    Descargar {p.name}
                                </Link>
                            </Box>
                        ))}
                    </Box>
                ));
            } else {
                console.log("[ZeroCart] No digital products found in response");
                nube.render("after_main_content", (
                    <Box padding="16px" background="surfaceSecondary">
                        <Text>Tus archivos digitales estarán disponibles pronto en tu correo electrónico.</Text>
                    </Box>
                ));
            }
        } catch (error) {
            console.error("[ZeroCart] Error fetching drive URL:", error);
            nube.render("after_main_content", (
                <Box padding="16px" background="surfaceError">
                    <Text>Hubo un problema al cargar el enlace, revisa tu correo electrónico para obtener los archivos.</Text>
                </Box>
            ));
        }
    };

    const handleState = (state: any) => {
        if (!state) {
            console.warn("[ZeroCart] No state provided to handleState");
            return;
        }

        const { location, cart, store, order } = state;
        const pageType = location?.page?.type;
        const step = location?.page?.data?.step;

        console.log(`[ZeroCart] 📄 Page: ${pageType} | Step: ${step}`);

        // DIAGNOSTIC: Log IDs found in state to see what's available on success page
        console.log("[ZeroCart] 🔍 ID Discovery:", {
            cartId: cart?.id,
            orderId: order?.id,
            orderCartId: order?.cart_id,
            checkoutId: location?.page?.data?.checkoutId
        });

        if (pageType === "checkout" && step === "success") {
            // Priority: cart.id (if still there), then order.cart_id (common on success), then order.id (fallback)
            const cartId = cart?.id || order?.cart_id || location?.page?.data?.cartId || order?.id;
            const storeId = store?.id;

            if (cartId && storeId) {
                renderContent(cartId, storeId);
            } else {
                console.warn("[ZeroCart] ⚠️ Could not determine cartId/storeId on success page", { cartId, storeId });
                // Fallback: try to log a bit of state for debugging
                console.log("[ZeroCart] 🕵️ Store Keys:", store ? Object.keys(store) : "null");
                console.log("[ZeroCart] 🕵️ Cart Keys:", cart ? Object.keys(cart) : "null");
            }
        } else {
            // Clear if not on success page
            nube?.render("after_main_content", []);
        }
    };

    // Register event listener
    try {
        nube.on("location:updated", (state) => {
            console.log("[ZeroCart] 📍 location:updated event received");
            handleState(state);
        });

        // Initial check
        const initialState = nube.getState?.();
        console.log("[ZeroCart] Initial state fetched during App() initialization");
        if (initialState) handleState(initialState);

    } catch (err) {
        console.error("[ZeroCart] ❌ Error during NubeSDK event registration:", err);
    }
}
