export const reviewName = (name: string) => {
    return name.toLowerCase().split(' ').filter((word) => word != '').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const reviewEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email.trim().toLocaleLowerCase()) ? email.trim().toLocaleLowerCase() : '';
};

export const reviewPassword = (password: string) => {
    return password.length < 6 ? '' : password;
};