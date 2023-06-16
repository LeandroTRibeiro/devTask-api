export const getDate = () => {
    const curDate = new Date();

    const day = curDate.getDate().toString().padStart(2,'0');
    const month = curDate.toLocaleDateString('default', {month: 'long'});
    const year = curDate.getFullYear();

    return `${day} de ${month} de ${year}`;
};