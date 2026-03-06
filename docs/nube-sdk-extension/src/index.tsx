import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Box, Text, Link } from "@tiendanube/nube-sdk-jsx"; // Removed NubeSDK from this import as it's a type, not a component

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

    const renderContent = async (orderId: string, storeId: string) => {
        console.log("[ZeroCart] Rendering content for order:", orderId);

        // Show loading state
        nube.render("after_main_content", (
            <Box padding="16px" background="surfaceSecondary">
                <Text modifiers={["bold"]}>Cargando tu enlace de descarga...</Text>
            </Box>
        ));

        try {
            const response = await fetch(
                `https://zerocart.jrengifo.com/api/order/details?cart_id=${orderId}&store_id=${storeId}`
            );

            if (!response.ok) {
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
                nube.render("after_main_content", (
                    <Box padding="16px" background="surfaceSuccess">
                        <Text>Tus archivos digitales (si aplicables) estarán disponibles pronto en tu correo electrónico.</Text>
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

        const { location, cart, store } = state;
        console.log("[ZeroCart] Current page:", location?.page?.type, "| step:", location?.page?.data?.step);

        if (location?.page?.type === "checkout" && location?.page?.data?.step === "success") {
            const orderId = cart?.id;
            const storeId = store?.id;

            if (orderId && storeId) {
                renderContent(orderId, storeId);
            } else {
                console.warn("[ZeroCart] Missing cart.id or store.id in state");
            }
        } else {
            // Clear if not on success page
            nube.render("after_main_content", []);
        }
    };

    // Register event listener
    try {
        nube.on("location:updated", (state, event) => {
            console.log("[ZeroCart] 📍 location:updated event received:", event);
            handleState(state);
        });

        // Initial check
        const initialState = nube.getState?.();
        console.log("[ZeroCart] Initial state fetched:", initialState);
        if (initialState) handleState(initialState);

    } catch (err) {
        console.error("[ZeroCart] ❌ Error during NubeSDK event registration:", err);
    }
}

