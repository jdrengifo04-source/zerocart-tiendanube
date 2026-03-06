import type { NubeSDK, NubeComponent } from "@tiendanube/nube-sdk-types";

/**
 * [ZeroCart] NubeSDK Checkout Extension - Version 24 (Diagnostic)
 * 
 * Goal: Identify which slots are active and force premium styling.
 */

export function App(nube: NubeSDK) {
    console.log("[ZeroCart] 🛡️ Diagnostic Version 24 Initialized.");

    const slotsToTest = ["after_header", "before_main_content"] as const;

    const renderDiagnostic = (cartId: string, storeId: string) => {
        console.log(`[ZeroCart] 🛠️ Rendering Diagnostic UI for ${cartId}`);

        slotsToTest.forEach(slot => {
            nube.render(slot as any, [
                {
                    type: "box",
                    padding: "24px",
                    margin: "16px",
                    background: "surface",
                    borderRadius: "12px",
                    style: {
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        border: "2px solid #3B82F6", // Blue border to identify NubeSDK rendering
                    },
                    children: [
                        {
                            type: "row",
                            alignItems: "center",
                            gap: "12px",
                            children: [
                                { type: "icon", name: "check-circle", color: "#3B82F6", size: "24px" },
                                {
                                    type: "txt",
                                    children: `Slot: ${slot} (v24)`,
                                    modifiers: ["bold"],
                                    style: { fontSize: "18px", color: "#111827" }
                                }
                            ]
                        },
                        {
                            type: "box",
                            margin: "12px 0",
                            children: [
                                {
                                    type: "txt",
                                    children: "Si ves este cuadro azul con sombra, el diseño premium está funcionando.",
                                    style: { color: "#4B5563" }
                                }
                            ]
                        },
                        {
                            type: "link",
                            href: "#",
                            variant: "primary",
                            style: { padding: "8px 16px", borderRadius: "6px" },
                            children: ["Botón de Prueba"]
                        }
                    ]
                }
            ]);
        });
    };

    const handleStateUpdate = (state: any, source: string) => {
        if (!state) return;
        const { location, cart, store, order } = state;
        const pageType = location?.page?.type;
        const step = location?.page?.data?.step;

        const cartId = cart?.id || order?.cart_id || location?.page?.data?.cartId || order?.id;
        const storeId = store?.id;

        if (pageType === "checkout" && step === "success") {
            if (cartId && storeId) {
                renderDiagnostic(cartId, storeId);
            }
        }
    };

    const events = ["location:updated", "cart:updated", "ui:updated", "order:updated"];
    events.forEach(evt => {
        try {
            nube.on(evt as any, (state) => handleStateUpdate(state, evt));
        } catch (e) { }
    });

    const initialState = nube.getState?.();
    if (initialState) handleStateUpdate(initialState, "initial");
}
