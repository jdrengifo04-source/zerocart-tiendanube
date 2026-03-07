import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
    const whatsappUrl = "https://wa.link/5wepc7";

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed z-[9999] group"
            style={{ bottom: '32px', right: '32px' }}
        >
            {/* Pulse Effect - WhatsApp Green */}
            <div className="absolute inset-0 bg-[#25D366]/30 rounded-full animate-ping group-hover:animate-none opacity-50" />

            {/* Button Body - WhatsApp Brand Green */}
            <div className="relative flex items-center justify-center bg-[#25D366] hover:bg-[#128C7E] w-12 h-12 rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.3)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_8px_32px_rgba(37,211,102,0.4)]">
                <MessageCircle className="text-white fill-white/10 w-6 h-6 transition-transform duration-300 group-hover:rotate-[8deg]" />
            </div>
        </a>
    );
};

export default WhatsAppButton;
