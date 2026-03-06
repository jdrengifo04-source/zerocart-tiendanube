import { NubeSDK } from "@tiendanube/nube-sdk-types";
import { Box, Text, Link } from "@tiendanube/nube-sdk-jsx";

export function App(nube: NubeSDK) {
    console.log("[ZeroCart] Extension App initialized successfully.");

    // Listen for navigation changes to detect the "success" checkout step
    nube.on("location:updated", async (eventData: any) => {
        console.log("[ZeroCart] location:updated event received:", eventData);
        const state = eventData?.state || (nube as any).getState?.();
        if (!state) {
            console.warn("[ZeroCart] No state found in eventData or nube.getState()");
            return;
        }

        const { location, cart, store } = state;
        console.log("[ZeroCart] Current step:", location?.page?.data?.step);

        if (
            location?.page?.type === "checkout" &&
            location?.page?.data?.step === "success"
        ) {
            // We are on the Thank You page.
            // Using cart ID as an order identifier fallback until explicitly confirmed by Tiendanube
            const orderIdentifier = cart?.id;
            const storeId = store?.id;

            if (!orderIdentifier) return;

            // Render a loading state first
            nube.render("after_main_content", (
                <Box padding="16px" background="surfaceSecondary">
                    <Text modifiers={["bold"]}>Cargando tu enlace de descarga...</Text>
                </Box>
            ));

            try {
                // Fetch order details from our backend to get the drive URL
                const response = await fetch(`https://api.zerocart.app/api/order/details?cart_id=${orderIdentifier}&store_id=${storeId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch order details.");
                }
                const data = await response.json();

                // If products are returned with Google Drive links
                if (data && data.products && data.products.length > 0) {
                    // Render the Download Card using declarative components
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
                    // Render generic success if no digital products are found
                    nube.render("after_main_content", (
                        <Box padding="16px" background="surfaceSuccess">
                            <Text>
                                Tus archivos digitales (si aplicables) estarán disponibles pronto en tu correo electrónico.
                            </Text>
                        </Box>
                    ));
                }
            } catch (error) {
                console.error("Error fetching drive URL:", error);
                nube.render("after_main_content", (
                    <Box padding="16px" background="surfaceError">
                        <Text>
                            Hubo un problema al cargar el enlace, revisa tu correo electrónico para obtener los archivos.
                        </Text>
                    </Box>
                ));
            }
        } else {
            // Clear the slot if we navigate away from the success step
            nube.render("after_main_content", []);
        }
    });
}
