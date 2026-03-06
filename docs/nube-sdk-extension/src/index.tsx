import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Box, Text, Link } from "@tiendanube/nube-sdk-jsx";

// Import nube from global context (injected by Web Worker sandbox)
declare const nube: NubeSDK;

console.log("[ZeroCart] 🚀 index.global.js IIFE loaded and executing...");

const renderContent = async (orderIdentifier: string, storeId: string) => {
    // Render a loading state first
    nube.render("after_main_content", (
        <Box padding="16px" background="surfaceSecondary">
            <Text modifiers={["bold"]}>Cargando tu enlace de descarga...</Text>
        </Box>
    ));

    try {
        const response = await fetch(`https://zerocart.jrengifo.com/api/order/details?cart_id=${orderIdentifier}&store_id=${storeId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch order details. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("[ZeroCart] Order metadata fetched successfully", data);

        if (data && data.products && data.products.length > 0) {
            nube.render("after_main_content", (
                <Box padding="16px" background="surfaceSuccess">
                    <Text modifiers={["bold"]}>
                        {data.config?.headline || "¡Aquí tienes tus productos digitales!"}
                    </Text>
                    <Box margin="8px">
                        <Text>
                            {data.config?.message || "Haz clic en el enlace de abajo para acceder a tus archivos de Google Drive asociados a esta compra."}
                        </Text>
                    </Box>

                    {data.products.map((product: any) => (
                        <Box key={product.id} margin="8px">
                            <Link href={product.googleDriveLink} variant="primary" target="_blank">
                                Descargar {product.name}
                            </Link>
                        </Box>
                    ))}
                </Box>
            ));
        } else {
            nube.render("after_main_content", (
                <Box padding="16px" background="surfaceSuccess">
                    <Text>
                        Tus archivos digitales (si aplicables) estarán disponibles pronto en tu correo electrónico.
                    </Text>
                </Box>
            ));
        }
    } catch (error) {
        console.error("[ZeroCart] Error fetching drive URL:", error);
        nube.render("after_main_content", (
            <Box padding="16px" background="surfaceError">
                <Text>
                    Hubo un problema al cargar el enlace, revisa tu correo electrónico para obtener los archivos.
                </Text>
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
    console.log("[ZeroCart] Current page type:", location?.page?.type, "| Current step:", location?.page?.data?.step);

    if (
        location?.page?.type === "checkout" &&
        location?.page?.data?.step === "success"
    ) {
        // We are on the Thank You page.
        const orderIdentifier = cart?.id;
        const storeId = store?.id;

        if (orderIdentifier && storeId) {
            console.log("[ZeroCart] On success page, starting renderContent for order:", orderIdentifier);
            renderContent(orderIdentifier, storeId);
        } else {
            console.warn("[ZeroCart] Missing orderIdentifier or storeId in cart/store data");
        }
    } else {
        // Clear the slot if we navigate away from the success step
        nube.render("after_main_content", []);
    }
};

// 1. Listen for navigation changes (for eventual single-page navigations)
nube.on("location:updated", async (eventData: any) => {
    console.log("[ZeroCart] location:updated event received:", eventData);
    const state = eventData?.state || (nube as any).getState?.();
    handleState(state);
});

// 2. Immediately evaluate current state on initial load
try {
    const initialState = (nube as any).getState?.();
    console.log("[ZeroCart] Initial state fetched synchronously:", initialState);
    if (initialState) {
        handleState(initialState);
    }
} catch (e) {
    console.warn("[ZeroCart] Error fetching initial state directly:", e);
}
