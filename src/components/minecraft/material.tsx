"use client";
import React, { useEffect } from 'react';

type Props = {
    itemType: string,
    itemName: string,
    className?: string,
    size?: number,
};

export const Material = ({ itemType, itemName, className, size = 64 }: Props) => {
    useEffect(() => {
        const loadScript = (src: string, integrity: string, crossorigin: string) => {
            return new Promise<void>((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.integrity = integrity;
                script.crossOrigin = crossorigin;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
                document.body.appendChild(script);
            });
        };

        const distance = 20;
        const blockSize = 14;
        const loadScripts = async () => {
            try {
                await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js", "sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=", "anonymous");
                await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/94/three.min.js", "sha256-NGC9JEuTWN4GhTj091wctgjzftr+8WNDmw0H8J5YPYE=", "anonymous");
                await loadScript("https://cdn.jsdelivr.net/gh/InventivetalentDev/MineRender@1.4.6/dist/model.min.js", "", "");

                if ((window as any).ModelRender) {
                    const modelRender = new (window as any).ModelRender({
                        showOutlines: false,    // Debugging - Show bounding boxes
                        showAxes: false,        // Debugging - Show the scene's axes
                        showGrid: false,        // Debugging - Show coordinate grid
                        autoResize: false,      // Whether to automatically resize the canvas
                        controls: {
                            enabled: false,      // Toggle controls
                            zoom: false,         // Toggle zooming
                            rotate: false,      // Toggle rotation
                            pan: false           // Toggle panning
                        },
                        camera: {               // Camera position
                            x: itemType == "item" ? 0 : distance, // Adjusted to be closer
                            y: itemType == "item" ? 0 : distance, // Adjusted to be closer
                            z: distance, // Adjusted to be closer
                            target: itemType == "item" ? [0, 0, 0] : [blockSize, blockSize, blockSize]   // Where the camera should look
                        },
                        canvas: {               // Dimensions the canvas starts off with (undefined -> use window size)
                            width: size,
                            height: size
                        },
                        pauseHidden: true,   // Whether to pause animations that aren't currently visible
                        centerCube: true,
                        assetRoot: `https://assets.mcasset.cloud/1.13`
                    }, document.getElementById("myBlockContainer"));
                    modelRender.render([`${itemType}/${itemName}`]);
                } else {
                    console.error("ModelRender is not available on the window object.");
                }
            } catch (error) {
                console.error(error);
            }
        };

        loadScripts();

        return () => {
            const scripts = document.querySelectorAll('script[src*="jquery.min.js"], script[src*="three.min.js"], script[src*="model.min.js"]');
            scripts.forEach(script => document.body.removeChild(script));
        };
    }, [itemType, itemName]);

    return (
        <div className={className} id="myBlockContainer" ></div>
    );
};