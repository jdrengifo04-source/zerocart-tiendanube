/**
 * ZeroCart Checkout Extension V32 - Non-DOM State
 * Fixes:
 * 1. ReferenceError: document is not defined (Runs in restricted environment)
 * 2. Infinite Loop / Flickering (State-based tracking)
 */
function initZeroCartV32(nube) {
    const VERSION = "V32-FinalFix";
    console.log(`[ZeroCart] 🛡️ Checkout Extension ${VERSION} Initializing...`);

    // Pure state tracking (no DOM dependencies)
    let lastRenderedOrderId = null;
    let isFetching = false;

    const renderThankYouSubroutine = async (state) => {
        const { cart, order, location, store } = state;

        // Extraction priority
        const orderIdentifier = order?.id || cart?.id || location?.page?.data?.cartId;
        const storeId = store?.id || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('store_id') : null);

        if (!orderIdentifier || !storeId) return;

        // PREVENT REDUNDANT RENDERS:
        // Since we can't check the DOM with document.querySelector, we rely strictly on our internal state.
        if (lastRenderedOrderId === orderIdentifier) {
            // Already rendered this order successfully, skip to prevent flickering
            return;
        }

        if (isFetching) return;

        console.log(`[ZeroCart] 🎯 detected Success Page for Order ${orderIdentifier}.`);
        isFetching = true;

        // Only show "Loading" if we haven't rendered this specific order yet
        nube.render("after_header", [{
            type: "box",
            background: "surface",
            padding: "24px",
            borderRadius: "16px",
            style: { marginTop: "20px", textAlign: "center", border: "1px dashed #3b82f6" },
            children: [{ type: "txt", children: "Cargando tus enlaces de descarga...", modifiers: ["bold"] }]
        }]);

        try {
            const response = await fetch(`https://zerocart.jrengifo.com/api/order/details?cart_id=${orderIdentifier}&store_id=${storeId}`);
            if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

            const data = await response.json();

            if (data.products && data.products.length > 0) {
                console.log(`[ZeroCart] ✅ Rendering premium UI for ${data.products.length} products.`);

                const product = data.products[0];
                const headline = data.config?.headline || "¡Tu compra ha sido aprobada!";
                const message = data.config?.message || "Gracias por confiar en ZeroCart.";
                const downloadUrl = product.googleDriveLink || "#";

                nube.render("after_header", [{
                    type: "box",
                    background: "surface",
                    borderRadius: "24px",
                    width: "100%",
                    direction: "col",
                    style: {
                        marginTop: "32px",
                        marginBottom: "32px",
                        marginLeft: "auto",
                        marginRight: "auto",
                        maxWidth: "448px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #f3f4f6",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column"
                    },
                    children: [
                        {
                            type: "col",
                            alignItems: "center",
                            style: { paddingTop: "40px", paddingBottom: "24px", paddingLeft: "32px", paddingRight: "32px", display: "flex", flexDirection: "column" },
                            children: [
                                {
                                    type: "box",
                                    background: "#f0fdf4",
                                    borderRadius: "100px",
                                    direction: "col",
                                    style: { marginBottom: "16px", paddingTop: "12px", paddingBottom: "12px", paddingLeft: "12px", paddingRight: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
                                    children: [{ type: "icon", name: "check-circle", color: "#10b981", size: "64px" }]
                                },
                                { type: "txt", children: headline, modifiers: ["bold"], style: { fontSize: "30px", color: "#1e293b", textAlign: "center", lineHeight: "1.2" } },
                                { type: "txt", children: message, style: { fontSize: "16px", color: "#64748b", marginTop: "8px", textAlign: "center" } }
                            ]
                        },
                        { type: "box", height: "1px", background: "#f3f4f6", style: { marginLeft: "32px", marginRight: "32px" } },
                        {
                            type: "col",
                            alignItems: "center",
                            style: { paddingTop: "32px", paddingBottom: "32px", paddingLeft: "32px", paddingRight: "32px", display: "flex", flexDirection: "column" },
                            children: [
                                product.image ? {
                                    type: "box",
                                    width: "192px",
                                    height: "192px",
                                    borderRadius: "16px",
                                    direction: "col",
                                    style: { marginBottom: "24px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", overflow: "hidden", display: "flex", flexDirection: "column" },
                                    children: [{ type: "img", src: product.image, alt: product.name, width: "100%", height: "100%", style: { objectFit: "cover" } }]
                                } : {
                                    type: "box",
                                    width: "192px",
                                    height: "192px",
                                    background: "#3b82f6",
                                    borderRadius: "16px",
                                    direction: "col",
                                    style: { marginBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
                                    children: [{ type: "txt", children: "Z", style: { fontSize: "80px", color: "white", fontWeight: "900" } }]
                                },
                                { type: "txt", children: product.name, modifiers: ["bold"], style: { fontSize: "24px", color: "#1e293b", marginBottom: "4px" } },
                                {
                                    type: "box",
                                    background: "#dcfce7",
                                    borderRadius: "100px",
                                    direction: "col",
                                    style: { paddingTop: "4px", paddingBottom: "4px", paddingLeft: "12px", paddingRight: "12px", display: "flex", flexDirection: "column", alignItems: "center" },
                                    children: [{ type: "txt", children: " Listo para descargar", style: { fontSize: "14px", color: "#15803d", fontWeight: "600" } }]
                                }
                            ]
                        },
                        {
                            type: "box",
                            direction: "col",
                            style: { paddingLeft: "32px", paddingRight: "32px", paddingBottom: "32px", display: "flex", flexDirection: "column" },
                            children: [{
                                type: "link",
                                href: downloadUrl,
                                variant: "primary",
                                style: { width: "100%", paddingTop: "16px", paddingBottom: "16px", paddingLeft: "16px", paddingRight: "16px", borderRadius: "16px", background: "#3b82f6", color: "white", fontWeight: "700", fontSize: "18px", textAlign: "center", boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)", display: "block" },
                                children: ["Descargar Ahora"]
                            }]
                        }
                    ]
                }]);

                // CRITICAL: Set tracking only after successful render
                lastRenderedOrderId = orderIdentifier;
            } else {
                console.log("[ZeroCart] No digital products found.");
                nube.render("after_header", []);
            }
        } catch (error) {
            console.error("[ZeroCart] Fetch error:", error);
        } finally {
            isFetching = false;
        }
    };

    const handleStateChange = (state) => {
        const isSuccessPage = state?.location?.page?.type === "checkout" && state?.location?.page?.data?.step === "success";
        if (isSuccessPage) {
            renderThankYouSubroutine(state);
        } else if (lastRenderedOrderId !== null) {
            // Reset state if we moved away from success page
            lastRenderedOrderId = null;
            nube.render("after_header", []);
        }
    };

    // Events
    ["location:updated", "cart:updated", "order:updated"].forEach(event => {
        try {
            nube.on(event, (state) => handleStateChange(state));
        } catch (e) {
            console.warn(`[ZeroCart] Event error: ${event}`);
        }
    });

    // Conservative Polling (3s)
    setInterval(() => {
        handleStateChange(nube.getState());
    }, 3000);

    // Initial check
    const initialState = nube.getState();
    if (initialState) handleStateChange(initialState);
}

export { initZeroCartV32 as App };
