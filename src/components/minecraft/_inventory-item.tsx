"use client"

//TODO : https://minecraftjapan.miraheze.org/wiki/%E3%83%98%E3%83%AB%E3%83%97:%E7%94%BB%E5%83%8F%E3%81%AE%E4%BD%9C%E6%88%90%E6%96%B9%E6%B3%95
import { useEffect, useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { css } from '@/styled-system/css';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

type props = {
    namespacedId: string; // minecraft:stone
    size?: number;
    className?: string;
    count?: number;
}

/**
 * Minecraftのモデルデータを表すインターフェース
 * 参考: https://minecraft.fandom.com/ja/wiki/%E3%83%A2%E3%83%87%E3%83%AB
 */
interface ModelData {
    // 親モデルのパス（例: "block/cube_all"）
    parent?: string;
    
    // モデルの光の当たり方の設定（アイテムモデルのみ）
    // "side": デフォルト、モデルの側面から光が当たる
    // "front": モデルの正面から光が当たる
    gui_light?: 'side' | 'front';
    
    // モデルで使用するテクスチャの定義
    textures?: {
        // パーティクル用テクスチャ
        particle?: string;
        
        // キューブの各面用テクスチャ
        down?: string;
        up?: string;
        north?: string;
        east?: string;
        south?: string;
        west?: string;
        
        // 全ての面に適用するテクスチャ
        all?: string;
        
        // アイテムのレイヤー用テクスチャ（0が最下層）
        layer0?: string;
        layer1?: string;
        layer2?: string;
        
        // その他のカスタムテクスチャ変数
        [key: string]: string | undefined;
    };
    
    // モデルの表示設定（位置、回転、スケール）
    display?: {
        // インベントリ内での表示設定
        gui?: {
            rotation?: [number, number, number]; // X, Y, Z軸の回転（度数法）
            translation?: [number, number, number]; // X, Y, Z軸の移動（ピクセル単位）
            scale?: [number, number, number]; // X, Y, Z軸のスケール（1.0が標準）
        };
        
        
        // 額縁内での表示設定
        fixed?: {
            rotation?: [number, number, number];
            translation?: [number, number, number];
            scale?: [number, number, number];
        };
    };
    
    // モデルの要素（キューブや平面）の定義
    elements?: Array<{
        // 要素の開始位置と終了位置（0〜16の範囲、単位はピクセル）
        from?: [number, number, number];
        to?: [number, number, number];
        
        // 要素の回転設定
        rotation?: {
            origin?: [number, number, number]; // 回転の中心点
            axis?: 'x' | 'y' | 'z'; // 回転軸
            angle?: number; // 回転角度（-45, -22.5, 0, 22.5, 45のいずれか）
            rescale?: boolean; // 回転後にスケールを調整するか
        };
        
        // 要素の各面の設定
        faces?: {
            down?: {
                uv?: [number, number, number, number]; // テクスチャのUV座標
                texture?: string; // 使用するテクスチャの変数名（#付き）
                cullface?: 'down' | 'up' | 'north' | 'south' | 'east' | 'west'; // カリングする面
                rotation?: 0 | 90 | 180 | 270; // テクスチャの回転（度数法）
                tintindex?: number; // 色合いのインデックス
            };
            up?: {
                uv?: [number, number, number, number];
                texture?: string;
                cullface?: 'down' | 'up' | 'north' | 'south' | 'east' | 'west';
                rotation?: 0 | 90 | 180 | 270;
                tintindex?: number;
            };
            north?: {
                uv?: [number, number, number, number];
                texture?: string;
                cullface?: 'down' | 'up' | 'north' | 'south' | 'east' | 'west';
                rotation?: 0 | 90 | 180 | 270;
                tintindex?: number;
            };
            south?: {
                uv?: [number, number, number, number];
                texture?: string;
                cullface?: 'down' | 'up' | 'north' | 'south' | 'east' | 'west';
                rotation?: 0 | 90 | 180 | 270;
                tintindex?: number;
            };
            east?: {
                uv?: [number, number, number, number];
                texture?: string;
                cullface?: 'down' | 'up' | 'north' | 'south' | 'east' | 'west';
                rotation?: 0 | 90 | 180 | 270;
                tintindex?: number;
            };
            west?: {
                uv?: [number, number, number, number];
                texture?: string;
                cullface?: 'down' | 'up' | 'north' | 'south' | 'east' | 'west';
                rotation?: 0 | 90 | 180 | 270;
                tintindex?: number;
            };
        };
        
        // 要素を表示するかどうか
        shade?: boolean;
    }>;
    
    // オーバーライド設定（特定の条件下で別のモデルを使用する）
    overrides?: Array<{
        predicate?: {
            [key: string]: number;
        };
        model?: string;
    }>;
}

interface ItemList {
    directories: string[];
    files: string[];
}

/**
 * スタイルを取得する関数
 */
const getStyles = (size: number) => {
    return {
        containerStyle: css({
            position: 'relative',
            width: `${size}px`,
            height: `${size}px`,
            imageRendering: 'pixelated',
        }),
        
        textureLayerStyle: css({
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
        }),
        
        countStyle: css({
            position: 'absolute',
            right: '0',
            bottom: '0',
            color: 'white',
            fontSize: 'xs',
            fontWeight: 'bold',
            textShadow: '0 1px 1px rgba(0,0,0,0.7)',
        }),
        
        loadingStyle: css({
            width: `${size}px`,
            height: `${size}px`,
            bg: 'gray.200',
            animation: 'pulse',
        }),
        
        errorStyle: css({
            width: `${size}px`,
            height: `${size}px`,
            bg: 'red.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'xs',
            color: 'red.500',
        }),
    };
};

/**
 * ローディング中の表示をレンダリングする関数
 */
const renderLoading = (loadingStyle: string, className?: string) => {
    return <div className={`${loadingStyle} ${className || ''}`}>
        <div className={css({
            width: '100%',
            height: '100%',
            background: 'gray.200',
            opacity: 0.7
        })} />
    </div>;
};

/**
 * エラー時の表示をレンダリングする関数
 */
const renderError = (errorStyle: string, className?: string, error?: string | null) => {
    return (
        <div className={`${errorStyle} ${className || ''}`}>
            <div className={css({
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'xs',
                color: 'red.500',
                background: 'red.100'
            })}>
                {error || 'No texture'}
            </div>
        </div>
    );
};

/**
 * テクスチャパスを正規化する関数
 * 例: minecraft:item/stone → /assets/minecraft/textures/item/stone.png
 */
const normalizeTexturePath = (texturePath: string): string => {
    if (texturePath.startsWith('#')) {
        throw new Error(`Unresolved texture reference: ${texturePath}`);
    }
    
    const [textureNamespace, texturePath2] = texturePath.includes(':') 
        ? texturePath.split(':') 
        : ['minecraft', texturePath];
        
    return `/assets/${textureNamespace}/textures/${texturePath2}.png`;
};

/**
 * テクスチャ参照を解決する関数
 * #で始まる参照を実際のテクスチャパスに解決する
 */
const resolveTextureReferences = (textures: Record<string, string | undefined>): Record<string, string> => {
    const resolved: Record<string, string> = {};
    
    // 参照が解決されるまで繰り返す
    const resolveReference = (key: string): string => {
        const value = textures[key];
        if (!value) {
            throw new Error(`Texture reference not found: ${key}`);
        }
        
        // #で始まる場合は参照
        if (value.startsWith('#')) {
            const refKey = value.substring(1); // #を除去
            return resolveReference(refKey);
        }
        
        return value;
    };
    
    // すべてのテクスチャを解決
    for (const [key, value] of Object.entries(textures)) {
        if (value) {
            try {
                resolved[key] = resolveReference(key);
            } catch (err) {
                console.warn(`Failed to resolve texture reference: ${key} -> ${value}`, err);
            }
        }
    }
    
    return resolved;
};

/**
 * 親モデルと子モデルをマージする関数
 */
const mergeModels = (parent: ModelData, child: ModelData): ModelData => {
    const result: ModelData = { ...parent };
    
    // テクスチャをマージ
    if (child.textures) {
        result.textures = { ...result.textures, ...child.textures };
    }
    
    // displayプロパティをマージ（guiのみ）
    if (child.display) {
        result.display = { ...result.display };
        
        // GUI表示設定をマージ
        if (child.display.gui) {
            if (!result.display) {
                result.display = {};
            }
            result.display.gui = { 
                ...result.display.gui,
                ...child.display.gui 
            };
        }
        
        // fixed表示設定をマージ
        if (child.display.fixed) {
            if (!result.display) {
                result.display = {};
            }
            result.display.fixed = { 
                ...result.display.fixed,
                ...child.display.fixed 
            };
        }
    }
    
    // gui_lightプロパティをマージ
    if (child.gui_light) {
        result.gui_light = child.gui_light;
    }
    
    // elementsプロパティをマージ（子モデルのものを優先）
    if (child.elements) {
        result.elements = [...child.elements];
    }
    
    // overridesプロパティをマージ（子モデルのものを優先）
    if (child.overrides) {
        result.overrides = [...child.overrides];
    }
    
    return result;
};

/**
 * モデルデータからテクスチャパスを抽出する関数
 */
const extractTexturePaths = async (modelData: ModelData): Promise<{ paths: string[], textureMap: Record<string, string> }> => {
    const textures: string[] = [];
    const textureMap: Record<string, string> = {}; // テクスチャ参照名とパスのマッピング
    
    if (!modelData.textures) {
        return { paths: textures, textureMap };
    }
    
    // テクスチャ参照を解決
    const resolvedTextures = resolveTextureReferences(modelData.textures);
    
    // アイテムモデルの場合はレイヤー順にテクスチャを追加
    let hasLayerTextures = false;
    
    // レイヤーテクスチャを順番に追加（layer0, layer1, ...）
    for (let i = 0; i < 10; i++) {
        const layerKey = `layer${i}`;
        if (resolvedTextures[layerKey]) {
            hasLayerTextures = true;
            const texturePath = normalizeTexturePath(resolvedTextures[layerKey]);
            textures.push(texturePath);
            textureMap[layerKey] = texturePath;
        }
    }
    
    // レイヤーテクスチャがない場合（ブロックモデルなど）
    if (!hasLayerTextures) {
        // elementsからテクスチャ参照を収集
        if (modelData.elements && modelData.elements.length > 0) {
            const textureRefs = new Set<string>();
            
            // すべての要素の面からテクスチャ参照を収集
            for (const element of modelData.elements) {
                if (element.faces) {
                    const faceKeys = ['up', 'down', 'north', 'south', 'east', 'west'] as const;

                    for (const faceKey of faceKeys) {
                        const face = element.faces[faceKey];
                        if (face && face.texture) {
                            // #から始まるテクスチャ参照を処理
                            let textureRef = face.texture;
                            if (textureRef.startsWith('#')) {
                                textureRef = textureRef.substring(1);
                            }
                            textureRefs.add(textureRef);
                        }
                    }
                }
            }
            
            // 収集したテクスチャ参照を解決して追加
            for (const textureRef of textureRefs) {
                if (resolvedTextures[textureRef]) {
                    const texturePath = normalizeTexturePath(resolvedTextures[textureRef]);
                    textures.push(texturePath);
                    textureMap[textureRef] = texturePath;
                }
            }
        }
        
        // 'all'テクスチャがあれば追加
        if (resolvedTextures.all) {
            const texturePath = normalizeTexturePath(resolvedTextures.all);
            if (!textures.includes(texturePath)) {
                textures.push(texturePath);
                textureMap['all'] = texturePath;
            }
        }
        
        // 'particle'テクスチャがあれば追加
        if (resolvedTextures.particle) {
            const texturePath = normalizeTexturePath(resolvedTextures.particle);
            if (!textures.includes(texturePath)) {
                textures.push(texturePath);
                textureMap['particle'] = texturePath;
            }
        }
        
        // 上記で何もテクスチャが見つからなかった場合は、元のテクスチャ定義から追加
        if (textures.length === 0) {
            for (const key in resolvedTextures) {
                if (key !== 'particle' && !key.startsWith('layer')) {
                    const texturePath = normalizeTexturePath(resolvedTextures[key]);
                    textures.push(texturePath);
                    textureMap[key] = texturePath;
                    break; // 最初の1つだけ追加
                }
            }
        }
    }
    
    // すべてのテクスチャ参照とパスのマッピングを作成
    for (const [key, value] of Object.entries(resolvedTextures)) {
        if (!textureMap[key] && value) {
            const texturePath = normalizeTexturePath(value);
            textureMap[key] = texturePath;
        }
    }
    
    // デバッグ用
    console.log('Extracted textures:', textures, 'texture map:', textureMap, 'from model:', modelData);
    
    return { paths: textures, textureMap };
};

/**
 * ビルトインモデルのデータを取得する関数
 */
const getBuiltinModelData = (modelName: string): ModelData | null => {
    // ビルトインモデルの定義
    const builtinModels: Record<string, ModelData> = {
        'builtin/generated': {
            gui_light: 'front',
            display: {
                gui: {
                    rotation: [0, 0, 0],
                    translation: [0, 0, 0],
                    scale: [1, 1, 1]
                },
                fixed: {
                    rotation: [0, 0, 0],
                    translation: [0, 0, 0],
                    scale: [0.5, 0.5, 0.5]
                }
            }
        },
        'builtin/entity': {
            gui_light: 'front',
            display: {
                gui: {
                    rotation: [0, 0, 0],
                    translation: [0, 0, 0],
                    scale: [1, 1, 1]
                }
            }
        },
        'builtin/hand': {
            gui_light: 'front',
            display: {
                gui: {
                    rotation: [0, 0, 0],
                    translation: [0, 0, 0],
                    scale: [1, 1, 1]
                }
            }
        }
    };
    
    return builtinModels[modelName] || null;
};

/**
 * 親モデルを含めて再帰的にモデルデータを取得する関数
 */
const fetchModelWithParents = async (modelPath: string): Promise<ModelData> => {
    console.log('Fetching model:', modelPath);
    
    // ビルトインモデルの処理
    if (modelPath.includes('/builtin/')) {
        const builtinModelName = modelPath.substring(modelPath.lastIndexOf('/') + 1).replace('.json', '');
        const fullBuiltinName = `builtin/${builtinModelName}`;
        const builtinModelData = getBuiltinModelData(fullBuiltinName);
        
        if (builtinModelData) {
            console.log(`Using builtin model: ${fullBuiltinName}`, builtinModelData);
            return builtinModelData;
        }
    }
    
    try {
        const response = await fetch(modelPath);
        if (!response.ok) {
            // 404エラーの場合、ビルトインモデルを試す
            if (response.status === 404) {
                // パスからモデル名を抽出
                const modelName = modelPath.substring(modelPath.lastIndexOf('/') + 1).replace('.json', '');
                
                // ビルトインモデルとして試す
                const builtinModelName = `builtin/${modelName}`;
                const builtinModelData = getBuiltinModelData(builtinModelName);
                
                if (builtinModelData) {
                    console.log(`Using builtin model for 404: ${builtinModelName}`, builtinModelData);
                    return builtinModelData;
                }
            }
            
            throw new Error(`Failed to fetch model: ${modelPath} (${response.status})`);
        }
        
        const modelJson = await response.json() as ModelData;
        console.log('Model data:', modelJson);
        
        // 親モデルがある場合は再帰的に取得
        if (modelJson.parent) {
            let parentPath = modelJson.parent;
            
            // ビルトインモデルの処理
            if (parentPath.startsWith('builtin/')) {
                const builtinModelData = getBuiltinModelData(parentPath);
                if (builtinModelData) {
                    console.log(`Using builtin parent model: ${parentPath}`, builtinModelData);
                    return mergeModels(builtinModelData, modelJson);
                }
            }
            
            // 親モデルのパスを正規化
            if (parentPath.includes(':')) {
                // 例: minecraft:item/generated → /assets/minecraft/models/item/generated.json
                const [parentNamespace, parentModelPath] = parentPath.split(':');
                parentPath = `/assets/${parentNamespace}/models/${parentModelPath}.json`;
            } else {
                // 例: item/generated → /assets/minecraft/models/item/generated.json
                // 相対パスの場合は現在のモデルと同じ名前空間を使用
                const currentNamespace = modelPath.split('/')[2]; // /assets/minecraft/models/...
                
                // 親パスが "block/" または "item/" で始まる場合はそのまま使用
                if (parentPath.startsWith('block/') || parentPath.startsWith('item/')) {
                    parentPath = `/assets/${currentNamespace}/models/${parentPath}.json`;
                } else if (parentPath.startsWith('builtin/')) {
                    // ビルトインモデルの場合は特別な処理
                    parentPath = `/assets/${currentNamespace}/models/${parentPath}.json`;
                } else {
                    // そうでない場合は、現在のモデルのディレクトリを基準にする
                    const currentPathParts = modelPath.split('/');
                    // 最後のファイル名を除去
                    currentPathParts.pop();
                    // 親パスを追加
                    const parentPathParts = parentPath.split('/');
                    
                    // 相対パスの解決
                    let resultPathParts = [...currentPathParts];
                    for (const part of parentPathParts) {
                        if (part === '..') {
                            resultPathParts.pop();
                        } else if (part !== '.') {
                            resultPathParts.push(part);
                        }
                    }
                    
                    parentPath = `${resultPathParts.join('/')}.json`;
                }
            }
            
            try {
                // 親モデルを取得
                const parentModel = await fetchModelWithParents(parentPath);
                
                // 親モデルとマージ
                return mergeModels(parentModel, modelJson);
            } catch (err) {
                console.warn(`Failed to fetch parent model: ${parentPath}`, err);
                // 親モデルの取得に失敗した場合でも、子モデルは返す
                return modelJson;
            }
        }
        
        return modelJson;
    } catch (err) {
        console.error(`Error fetching model: ${modelPath}`, err);
        throw err;
    }
};

/**
 * namespacedIDからモデルパスを取得する関数
 */
const getModelPath = async (namespacedId: string): Promise<string> => {
    // namespacedIdからアイテム名を抽出（例: minecraft:stone → stone）
    const [namespace, itemName] = namespacedId.split(':');
    if (!namespace || !itemName) {
        throw new Error(`Invalid namespacedId: ${namespacedId}`);
    }

    // アイテムリストを取得して、アイテムがitem内にあるかblockにあるか確認
    let modelType = 'item'; // デフォルトはitem
    let isBlock = false;
    let modelPath = '';

    try {
        // まずitemリストを確認
        const itemListResponse = await fetch(`/assets/${namespace}/models/item/_list.json`);
        if (itemListResponse.ok) {
            const itemList = await itemListResponse.json() as ItemList;
            
            // アイテム名がitemリストに含まれているか確認
            if (itemList.files.includes(`${itemName}.json`)) {
                // アイテムリストに含まれている場合はitem
                modelPath = `/assets/${namespace}/models/item/${itemName}.json`;
            } else {
                // itemリストになければblockリストを確認
                const blockListResponse = await fetch(`/assets/${namespace}/models/block/_list.json`);
                if (blockListResponse.ok) {
                    const blockList = await blockListResponse.json() as ItemList;
                    
                    // アイテム名がblockリストに含まれているか確認
                    if (blockList.files.includes(`${itemName}.json`)) {
                        isBlock = true;
                        modelPath = `/assets/${namespace}/models/block/${itemName}.json`;
                    } else {
                        // どちらにも見つからない場合はデフォルトでitemを使用
                        modelPath = `/assets/${namespace}/models/item/${itemName}.json`;
                    }
                } else {
                    // blockリストが取得できない場合はデフォルトでitemを使用
                    modelPath = `/assets/${namespace}/models/item/${itemName}.json`;
                }
            }
        } else {
            // itemリストが取得できない場合はデフォルトでitemを使用
            modelPath = `/assets/${namespace}/models/item/${itemName}.json`;
        }
    } catch (err) {
        console.warn('Failed to check item/block lists, falling back to item path', err);
        // エラーが発生した場合はデフォルトでitemを使用
        modelPath = `/assets/${namespace}/models/item/${itemName}.json`;
    }

    console.log(`Model path for ${namespacedId}: ${modelPath}, isBlock: ${isBlock}`);
    return modelPath;
};

/**
 * Three.jsでブロックをレンダリングするコンポーネント
 */
const BlockModel = ({ texturePaths, modelData, textureMap = {} }: { texturePaths: string[], modelData: ModelData | null, textureMap?: Record<string, string> }) => {
    // テクスチャをロード
    const textures = useLoader(TextureLoader, texturePaths);
    
    // テクスチャの設定
    textures.forEach(texture => {
        // ピクセルアートのためのフィルタリング設定
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        // アンチエイリアスを無効化
        texture.generateMipmaps = false;
    });
    
    // 回転アニメーション用の参照
    const meshRef = useRef<THREE.Mesh>(null);
    
    // モデルのGUI表示設定を取得
    const guiDisplay = modelData?.display?.gui;
    
    // アイテムモデルかブロックモデルかを判定
    const isItemModel = modelData?.textures?.layer0 !== undefined;
    
    // スケール値の取得（デフォルトは[1, 1, 1]）
    // スケールを大きくする
    const baseScale = isItemModel ? [1.5, 1.5, 1.5] : [0.7, 0.7, 0.7];
    const scale = guiDisplay?.scale || baseScale;
    
    // 回転値の取得（デフォルトは[0, 0, 0]）
    // ブロックの場合はデフォルトで少し回転させて見やすくする
    const defaultRotation = isItemModel ? [0, 0, 0] : [90, 90, 90];
    const rotation = guiDisplay?.rotation || defaultRotation;
    
    // 移動値の取得（デフォルトは[0, 0, 0]）
    const translation = guiDisplay?.translation || [0, 0, 0];
    
    if (!isItemModel) {
        // ブロックモデルの場合は立方体を表示
        // テクスチャマッピングの順序（Three.jsの順序）
        // 0: right (east), 1: left (west), 2: top (up), 3: bottom (down), 4: front (south), 5: back (north)
        const faceMapping = {
            east: 0,   // 右面
            west: 1,   // 左面
            up: 2,     // 上面
            down: 3,   // 下面
            south: 4,  // 前面
            north: 5   // 後面
        };
        
        // テクスチャパスとロードされたテクスチャのマッピングを作成
        const loadedTextureMap: Record<string, THREE.Texture> = {};
        
        // テクスチャマップからテクスチャを取得
        for (const [key, path] of Object.entries(textureMap)) {
            const textureIndex = texturePaths.indexOf(path);
            if (textureIndex !== -1 && textureIndex < textures.length) {
                loadedTextureMap[key] = textures[textureIndex];
            }
        }
        
        // 各面のテクスチャを決定
        const materialMaps: (THREE.Texture | null)[] = Array(6).fill(null);
        
        // elementsからテクスチャを取得
        if (modelData?.elements && modelData.elements.length > 0) {
            // 最初のelementのfacesを使用
            const element = modelData.elements[0];
            if (element.faces) {
                // 各面のテクスチャを設定
                for (const [faceName, face] of Object.entries(element.faces)) {
                    if (face && face.texture && faceName in faceMapping) {
                        const faceIndex = faceMapping[faceName as keyof typeof faceMapping];
                        
                        // テクスチャ参照を解決
                        let textureKey = face.texture;
                        if (textureKey.startsWith('#')) {
                            textureKey = textureKey.substring(1);
                        }
                        
                        // テクスチャマップから直接テクスチャを取得
                        if (loadedTextureMap[textureKey]) {
                            materialMaps[faceIndex] = loadedTextureMap[textureKey];
                        }
                    }
                }
            }
        }
        
        // 未設定の面には'all'テクスチャまたはデフォルトテクスチャを使用
        const allTexture = loadedTextureMap['all'] || textures[0] || null;
        
        // 未設定の面を埋める
        materialMaps.forEach((texture, index) => {
            if (texture === null) {
                materialMaps[index] = allTexture;
            }
        });
        
        return (
            <mesh 
                ref={meshRef}
                position={[translation[0] / 16, translation[1] / 16, translation[2] / 16]}
                rotation={[
                    THREE.MathUtils.degToRad(rotation[0]),
                    THREE.MathUtils.degToRad(rotation[1]),
                    THREE.MathUtils.degToRad(rotation[2])
                ]}
                scale={[scale[0] * 0.5, scale[1] * 0.5, scale[2] * 0.5]}
            >
                <boxGeometry args={[1, 1, 1]} />
                {materialMaps.map((texture, index) => (
                    <meshStandardMaterial 
                        key={index}
                        attach={`material-${index}`} 
                        map={texture} 
                        transparent={true}
                        alphaTest={0.5}
                    />
                ))}
            </mesh>
        );
    } else {
        // アイテムモデルの場合は平面を表示（テクスチャを重ねる）
        // テクスチャパスとロードされたテクスチャのマッピングを作成
        const loadedTextureMap: Record<string, THREE.Texture> = {};
        
        // テクスチャマップからテクスチャを取得
        for (const [key, path] of Object.entries(textureMap)) {
            const textureIndex = texturePaths.indexOf(path);
            if (textureIndex !== -1 && textureIndex < textures.length) {
                loadedTextureMap[key] = textures[textureIndex];
            }
        }
        
        // レイヤー順にテクスチャを取得
        const layerTextures: THREE.Texture[] = [];
        const layerIndices: number[] = [];
        
        // レイヤー順（layer0, layer1, layer2...）にテクスチャを収集
        for (let i = 0; i < 10; i++) {
            const layerKey = `layer${i}`;
            if (loadedTextureMap[layerKey]) {
                layerTextures.push(loadedTextureMap[layerKey]);
                layerIndices.push(i); // レイヤーインデックスを保存
            }
        }
        
        // レイヤーテクスチャが見つからない場合は、すべてのテクスチャを使用
        const displayTextures = layerTextures.length > 0 ? layerTextures : textures;
        
        return (
            <group
                position={[translation[0] / 16, translation[1] / 16, translation[2] / 16]}
                rotation={[
                    THREE.MathUtils.degToRad(rotation[0]),
                    THREE.MathUtils.degToRad(rotation[1]),
                    THREE.MathUtils.degToRad(rotation[2])
                ]}
                scale={[scale[0] * 0.5, scale[1] * 0.5, scale[2] * 0.5]}
            >
                {displayTextures.map((texture, index) => {
                    // レイヤーインデックスを取得（存在する場合）
                    const layerIndex = layerTextures.length > 0 ? layerIndices[index] : index;
                    
                    return (
                        <mesh key={index} position={[0, 0, 0.01 * layerIndex]}>
                            <planeGeometry args={[1, 1]} />
                            <meshBasicMaterial 
                                map={texture} 
                                transparent={true}
                                alphaTest={0.5}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    );
                })}
            </group>
        );
    }
};

/**
 * WebGLでアイテムをレンダリングする関数
 */
const renderItemWebGL = (
    texturePaths: string[],
    modelData: ModelData | null,
    textureMap: Record<string, string>,
    size: number,
    count?: number,
    styles?: ReturnType<typeof getStyles>,
    className?: string
) => {
    const { containerStyle, countStyle } = styles || getStyles(size);
    
    // テクスチャがない場合
    if (texturePaths.length === 0) {
        return (
            <div className={`${containerStyle} ${className || ''}`}>
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs">
                    No texture
                </div>
            </div>
        );
    }
    
    // ブロックモデルかどうかを判定
    const isItemModel = modelData?.textures?.layer0 !== undefined;
    
    // カメラの位置を調整（ブロックとアイテムで異なる設定）
    // カメラを近づけて、アイテムをより大きく表示
    const cameraPosition: [number, number, number] = isItemModel ? [0, 0, 1.5] : [0, 0, 1.5];
    const cameraFov = isItemModel ? 40 : 35;
    
    return (
        <div className={`${containerStyle} ${className || ''}`}>
            <Canvas
                camera={{ position: cameraPosition, fov: cameraFov }}
                style={{ width: '100%', height: '100%' }}
                gl={{       
                    antialias: false,
                    pixelRatio: 1,
                    precision: 'lowp'
                }}
            >
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 2, 5]} intensity={1} />
                <Suspense fallback={null}>
                    <BlockModel texturePaths={texturePaths} modelData={modelData} textureMap={textureMap} />
                </Suspense>
            </Canvas>
            
            {count !== undefined && count > 1 && (
                <div className={countStyle}>
                    {count}
                </div>
            )}
        </div>
    );
};

/**
 * マインクラフトのアイテムを表示するコンポーネント
 */
export const InventoryItem = ({
    namespacedId,
    size = 32,
    count,
    className,
}: {
    namespacedId: string;
    size?: number;
    count?: number;
    className?: string;
}) => {
    const [texturePaths, setTexturePaths] = useState<string[]>([]);
    const [textureMap, setTextureMap] = useState<Record<string, string>>({});
    const [modelData, setModelData] = useState<ModelData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const styles = getStyles(size);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // モデルパスを取得
                const modelPath = await getModelPath(namespacedId);
                console.log(`Model path for ${namespacedId}: ${modelPath}`);

                // モデルデータを取得（親モデルも含む）
                const modelData = await fetchModelWithParents(modelPath);
                console.log(`Model data for ${namespacedId}:`, modelData);
                setModelData(modelData);
                
                // テクスチャパスを抽出
                const { paths, textureMap } = await extractTexturePaths(modelData);
                console.log(`Texture paths for ${namespacedId}:`, paths);
                console.log(`Texture map for ${namespacedId}:`, textureMap);
                setTexturePaths(paths);
                setTextureMap(textureMap);
                
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching data for ${namespacedId}:`, err);
                setError(err instanceof Error ? err.message : String(err));
                setLoading(false);
            }
        };

        fetchData();
    }, [namespacedId]);

    if (loading) {
        return renderLoading(styles.loadingStyle, className);
    }

    if (error || texturePaths.length === 0) {
        return renderError(styles.errorStyle, className, error);
    }

    // WebGLでレンダリング
    return renderItemWebGL(texturePaths, modelData, textureMap, size, count, styles, className);
};
