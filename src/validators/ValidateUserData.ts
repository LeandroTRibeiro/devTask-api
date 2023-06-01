export const reviewName = (name: string) => {
    return name.toLowerCase().split(' ').filter((word) => word != '').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const reviewEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email.trim().toLocaleLowerCase()) ? email.trim().toLocaleLowerCase() : '';
};

export const reviewPassword = (password: string) => {
    return password.length < 6 ? '' : password;
};

// bellow validators need tests

export const reviewBirthday = (birthday: string) => {

    return birthday
            .trim()
            .split('-')
            .filter((item, index, arr) => 
                +arr[0] <= new Date().getFullYear() &&
                arr[0].length === 4 && 
                (+arr[1] <= 12 && +arr[1] > 0) && 
                (arr[1].length > 0 && arr[1].length < 3 ) &&
                (+arr[2] <= new Date(+arr[0], +arr[1], 0).getDate() && +arr[2] > 0)).length <= 0 ? '' : birthday.trim();

};