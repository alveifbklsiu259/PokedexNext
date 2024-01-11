'use client'
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";


export default function PokmeonsPortal() {
    const [isMounted, setIsMounted] = useState(false);
    const ref = useRef<Element>();
    

    useEffect(() => {
        ref.current = document.querySelector('#pokemonsContainer')!;
        setIsMounted(true);
    }, []);

    const content = (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.25
        }}>
            dsa45d46as
        </div>
    )

    return isMounted ? createPortal(content, ref.current!) : null
}