import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Box, Text, Link } from "@tiendanube/nube-sdk-jsx"; // Removed NubeSDK from this import as it's a type, not a component

/**
 * [ZeroCart] NubeSDK Checkout Extension
 * 
 * Note: Tiendanube Checkout V3 scripts run in a sandboxed Web Worker.
 * The 'nube' object is the primary interface.
 */

// We define the main logic in a way that it can be invoked manually or automatically
const initZeroCartExtension = (injectedNube: any) => {
    console.log("[ZeroCart] 🚀 Extension initialization sequence started.");

    // 1. DISCOVER THE SDK OBJECT
    // We check multiple sources because injection methods vary by environment
    const sdk: NubeSDK = injectedNube || (globalThis as any).nube || (self as any).nube;

    if (!sdk) {
        console.warn("[ZeroCart] ❌ SDK Object 'nube' NOT found in scope!");
        console.log("[ZeroCart] Global keys available in this worker:", Object.keys(self));
        return;
    }

    console.log("[ZeroCart] ✅ SDK Object 'nube' found. Methods:", Object.keys(sdk));

    const renderContent = async (orderId: string, storeId: string) => {
        console.log("[ZeroCart] Rendering content for order:", orderId);

        // Show loading state
        sdk.render("after_main_content", (
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
                sdk.render("after_main_content", (
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
                sdk.render("after_main_content", (
                    <Box padding="16px" background="surfaceSuccess">
                        <Text>Tus archivos digitales (si aplicables) estarán disponibles pronto en tu correo electrónico.</Text>
                    </Box>
                ));
            }
        } catch (error) {
            console.error("[ZeroCart] Error fetching drive URL:", error);
            sdk.render("after_main_content", (
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
                console.warn("[ZeroCart] Missing orderIdentifier or storeId in cart/store data");
            }
        } else {
            // Clear if not on success page
            sdk.render("after_main_content", []);
        }
    };

    // 2. REGISTER LISTENERS
    try {
        sdk.on("location:updated", (state, event) => {
            try {
                console.log("[ZeroCart] 📍 location:updated event received:", event);
                handleState(state);
            } catch (e) {
                console.error("[ZeroCart] Error inside location:updated handler:", e);
            }
        });

        // 3. INITIAL CHECK (in case we loaded after the event)
        const initialState = sdk.getState?.();
        console.log("[ZeroCart] Initial state fetched:", initialState);
        if (initialState) handleState(initialState);

    } catch (err) {
        console.error("[ZeroCart] ❌ CRITICAL ERROR during SDK registration:", err);
    }
};

// DEEP DIAGNOSTIC INSPECTION
const runDeepDiagnostics = () => {
    console.log("[ZeroCart] 🔎 DEEP DIAGNOSTIC START");

    // 1. Inspect __APP_DATA__ and __INITIAL_STATE__
    try {
        const appData = (self as any).__APP_DATA__;
        const initialState = (self as any).__INITIAL_STATE__;
        console.log("[ZeroCart] 📦 __APP_DATA__ Keys:", appData ? Object.keys(appData).join(", ") : "null");
        console.log("[ZeroCart] 📦 __INITIAL_STATE__ Keys:", initialState ? Object.keys(initialState).join(", ") : "null");
    } catch (e) {
        console.warn("[ZeroCart] Failed to inspect internal data objects.");
    }

    // 2. Intercept Message Events (Just in case it's injected via postMessage)
    self.addEventListener("message", (event) => {
        console.log("[ZeroCart] 📩 Message received in worker scope:", {
            type: typeof event.data,
            dataKeys: event.data && typeof event.data === 'object' ? Object.keys(event.data).join(", ") : "none"
        });

        // If message contains something that looks like an SDK
        if (event.data && (event.data.nube || event.data.sdk)) {
            console.log("[ZeroCart] 🌟 Potential SDK found in message event!");
            initZeroCartExtension(event.data.nube || event.data.sdk);
        }
    });

    // 3. Polling for globals
    const poll = (retries = 20) => {
        const keys = Object.keys(self).join(", ");
        // Check for common aliases
        const sdk = (globalThis as any).nube || (self as any).nube || (self as any).sdk || (self as any).tiendanube;

        if (sdk) {
            console.log("[ZeroCart] ✅ NubeSDK found via polling!");
            initZeroCartExtension(sdk);
        } else if (retries > 0) {
            if (retries % 4 === 0) {
                console.log(`[ZeroCart] 🔍 (Attempt ${21 - retries}) Keys in scope: ${keys}`);
            }
            setTimeout(() => poll(retries - 1), 250);
        } else {
            console.error("[ZeroCart] ❌ NubeSDK not found. Proveyendo esta lista de llaves al soporte.");
        }
    };

    poll();
};

console.log("[ZeroCart] 🛠️ Script parsing started...");
try {
    runDeepDiagnostics();
} catch (outerError) {
    console.error("[ZeroCart] 💀 Fatal crash during diagnostics:", outerError);
}
