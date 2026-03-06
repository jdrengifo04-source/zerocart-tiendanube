import type { NubeSDK } from "@tiendanube/nube-sdk-types";

/**
 * [ZeroCart] NubeSDK Checkout Extension - Version 21
 * 
 * Strict Component JSON Structure based on @tiendanube/nube-sdk-types definitions.
 */

export function App(nube: NubeSDK) {
    console.log("[ZeroCart] 🚀 Extension initialized (v21 - Strict JSON Components).");

    if (!nube) {
        console.error("[ZeroCart] ❌ 'nube' object missing!");
        return;
    }

    let lastStep = "";

    const renderContent = async (cartId: string, storeId: string) => {
        console.log("[ZeroCart] 💎 Rendering content for ID:", cartId);

        // Initial loading state
        nube.render("after_main_content", [
            {
                type: "box",
                padding: "16px",
                background: "surfaceSecondary",
                children: [
                    { type: "txt", children: "Cargando tu enlace de descarga..." }
                ]
            }
        ]);

        try {
            const url = `https://zerocart.jrengifo.com/api/order/details?cart_id=${cartId}&store_id=${storeId}`;
            console.log("[ZeroCart] 📡 Fetching:", url);

            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`[ZeroCart] Fetch failed (${response.status})`);
                if (response.status === 404) {
                    nube.render("after_main_content", [
                        {
                            type: "box",
                            padding: "16px",
                            background: "surfaceSecondary",
                            children: [
                                { type: "txt", children: "Tu pedido digital se está procesando... revisa tu email en unos minutos." }
                            ]
                        }
                    ]);
                    return;
                }
                throw new Error(`Status ${response.status}`);
            }

            const data = await response.json();
            console.log("[ZeroCart] 📦 Data received:", data);

            if (data && data.products && data.products.length > 0) {
                const productLinks = data.products.map((p: any) => ({
                    type: "box",
                    margin: "8px",
                    children: [
                        {
                            type: "link",
                            href: p.googleDriveLink,
                            variant: "primary",
                            target: "_blank",
                            children: `Descargar ${p.name}`
                        }
                    ]
                }));

                nube.render("after_main_content", [
                    {
                        type: "box",
                        padding: "16px",
                        background: "surfaceSuccess",
                        children: [
                            {
                                type: "txt",
                                children: data.config?.headline || "¡Aquí tienes tus productos digitales!",
                                modifiers: ["bold"]
                            },
                            {
                                type: "box",
                                margin: "8px",
                                children: [
                                    { type: "txt", children: data.config?.message || "Haz clic abajo para acceder a tus archivos." }
                                ]
                            },
                            ...productLinks
                        ]
                    }
                ]);
            } else {
                nube.render("after_main_content", [
                    {
                        type: "box",
                        padding: "16px",
                        background: "surfaceSecondary",
                        children: [
                            { type: "txt", children: "Tus archivos digitales estarán pronto en tu correo." }
                        ]
                    }
                ]);
            }
        } catch (error) {
            console.error("[ZeroCart] ❌ Render Error:", error);
            nube.render("after_main_content", [
                {
                    type: "box",
                    padding: "16px",
                    background: "surfaceError",
                    children: [
                        { type: "txt", children: "Hubo un problema. Revisa tu email para los enlaces." }
                    ]
                }
            ]);
        }
    };

    const handleStateUpdate = (state: any, source: string) => {
        if (!state) return;

        const { location, cart, store, order } = state;
        const pageType = location?.page?.type;
        const step = location?.page?.data?.step;

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
            }
        } else {
            if (pageType !== "checkout" || step !== "success") {
                nube.render("after_main_content", []);
            }
        }
    };

    const events = ["location:updated", "cart:updated", "ui:updated", "order:updated"];
    events.forEach(evt => {
        try {
            nube.on(evt as any, (state) => {
                handleStateUpdate(state, evt);
            });
        } catch (e) { /* ignore */ }
    });

    const watcher = setInterval(() => {
        try {
            const state = nube.getState?.();
            if (state) handleStateUpdate(state, "watcher");
        } catch (e) { }
    }, 2500);

    const initialState = nube.getState?.();
    if (initialState) handleStateUpdate(initialState, "initial");

    return () => clearInterval(watcher);
}


