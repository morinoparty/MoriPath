import { signInAction } from "../-api/sign-in-action";

export async function handleLogin() {
    const result = await signInAction();
    if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
    }
}
