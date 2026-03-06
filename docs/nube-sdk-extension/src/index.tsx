import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Box, Text, Link } from "@tiendanube/nube-sdk-jsx";

/**
 * [ZeroCart] NubeSDK Checkout Extension - Version 19
 * 
 * Optimized for Navigation Detection in Checkout V3.
 */
export function App(nube: NubeSDK) {
    console.log("[ZeroCart] 🚀 Extension initialized (v19).");

    if (!nube) {
        console.error("[ZeroCart] ❌ 'nube' object missing!");
        return;
    }

    let lastStep = "";

    const renderContent = async (cartId: string, storeId: string) => {
        console.log("[ZeroCart] 💎 Rendering content for ID:", cartId);

        nube.render("after_main_content", (
            <Box padding="16px" background="surfaceSecondary">
                <Text modifiers={["bold"]}>Cargando tu enlace de descarga...</Text>
            </Box>
        ));

        try {
            const url = `https://zerocart.jrengifo.com/api/order/details?cart_id=${cartId}&store_id=${storeId}`;
            console.log("[ZeroCart] 📡 Fetching:", url);

            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`[ZeroCart] Fetch failed (${response.status})`);
                if (response.status === 404) {
                    nube.render("after_main_content", (
                        <Box padding="16px" background="surfaceSecondary">
                            <Text>Tu pedido digital se está procesando... revisa tu email en unos minutos.</Text>
                        </Box>
                    ));
                    return;
                }
                throw new Error(`Status ${response.status}`);
            }

            const data = await response.json();
            console.log("[ZeroCart] 📦 Data received:", data);

            if (data && data.products && data.products.length > 0) {
                nube.render("after_main_content", (
                    <Box padding="16px" background="surfaceSuccess">
                        <Text modifiers={["bold"]}>{data.config?.headline || "¡Aquí tienes tus productos digitales!"}</Text>
                        <Box margin="8px">
                            <Text>{data.config?.message || "Haz clic abajo para acceder a tus archivos."}</Text>
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
                    <Box padding="16px" background="surfaceSecondary">
                        <Text>Tus archivos digitales estarán pronto en tu correo.</Text>
                    </Box>
                ));
            }
        } catch (error) {
            console.error("[ZeroCart] ❌ Render Error:", error);
            nube.render("after_main_content", (
                <Box padding="16px" background="surfaceError">
                    <Text>Hubo un problema. Revisa tu email para los enlaces.</Text>
                </Box>
            ));
        }
    };

    const handleStateUpdate = (state: any, source: string) => {
        if (!state) return;

        const { location, cart, store, order } = state;
        const pageType = location?.page?.type;
        const step = location?.page?.data?.step;

        // Avoid redundant processing if step hasn't changed
        const currentStepKey = `${pageType}:${step}`;
        if (currentStepKey === lastStep && source !== "initial") return;
        lastStep = currentStepKey;

        console.log(`[ZeroCart] 📍 State logic [via ${source}] -> Page: ${pageType} | Step: ${step}`);

        const cartId = cart?.id || order?.cart_id || location?.page?.data?.cartId || order?.id;
        const storeId = store?.id;

        if (pageType === "checkout" && step === "success") {
            console.log("[ZeroCart] 🎉 SUCCESS PAGE DETECTED!");
            if (cartId && storeId) {
                renderContent(cartId, storeId);
            } else {
                console.warn("[ZeroCart] ⚠️ Success detected but IDs missing:", { cartId, storeId });
                console.log("[ZeroCart] 🧪 Success State Trace:", JSON.stringify({
                    hasCart: !!cart,
                    hasOrder: !!order,
                    cartId: cart?.id,
                    orderId: order?.id,
                    orderCartId: order?.cart_id,
                    locData: location?.page?.data
                }));
            }
        } else {
            // Keep clean if not success
            if (pageType !== "checkout" || step !== "success") {
                nube.render("after_main_content", []);
            }
        }
    };

    // Register all potential events to capture navigation in Checkout V3
    const events = ["location:updated", "cart:updated", "ui:updated", "order:updated"];
    events.forEach(evt => {
        try {
            nube.on(evt as any, (state) => {
                console.log(`[ZeroCart] 🔔 Event: ${evt}`);
                handleStateUpdate(state, evt);
            });
        } catch (e) { /* ignore unsupported events */ }
    });

    // Fallback Watcher (Diagnostic): If events fail, check state manually
    const watcher = setInterval(() => {
        try {
            const state = nube.getState?.();
            if (state) handleStateUpdate(state, "watcher");
        } catch (e) {
            console.error("[ZeroCart] Watcher error:", e);
        }
    }, 2500);

    // Initial check
    const initialState = nube.getState?.();
    if (initialState) handleStateUpdate(initialState, "initial");

    // Cleanup (though App is usually alive for the checkout duration)
    return () => clearInterval(watcher);
}
