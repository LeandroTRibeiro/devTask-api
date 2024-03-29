import { reviewName } from './ValidateUserData';
import { reviewEmail } from './ValidateUserData';
import { reviewPassword } from './ValidateUserData';

describe('reviewName', () => {
    it('deve retornar o nome com as palavras capitalizadas', () => {
        const name1 = 'john doe';
        const resultado1 = reviewName(name1);
        expect(resultado1).toBe('John Doe');
    });

    it('deve retornar uma string vazia se o nome for vazio ou apenas com espaços', () => {
        const name = '';
        const resultado = reviewName(name);
        expect(resultado).toBe('');
        const name2 = '        ';
        const resultado2 = reviewName(name2);
        expect(resultado2).toBe('');
    });

    it('deve retornar o nome com as palavras capitalizadas mesmo com espaços extras', () => {
        const name = '   jane    smith   ';
        const resultado = reviewName(name);
        expect(resultado).toBe('Jane Smith');
    });

    it('deve retornar o nome original se já estiver capitalizado corretamente', () => {
        const name = 'John Doe';
        const resultado = reviewName(name);
        expect(resultado).toBe('John Doe');
    });
});

describe('reviewEmail', () => {
  it('deve retornar o email sem espaços em branco e em letras minúsculas', () => {
    const email1 = '   example@example.com   ';
    const resultado1 = reviewEmail(email1);
    expect(resultado1).toBe('example@example.com');
    const email2 = '   e x Am Ple @example.com   ';
    const resultado2 = reviewEmail(email2);
    expect(resultado2).toBe('');
  });

  it('deve retornar uma string vazia se o email for inválido', () => {
    const email = 'invalidemail';
    const resultado = reviewEmail(email);
    expect(resultado).toBe('');
  });

  it('deve retornar o email em letras minúsculas', () => {
    const email = 'Example@Example.com';
    const resultado = reviewEmail(email);
    expect(resultado).toBe('example@example.com');
  });

  it('deve retornar o email original se for válido', () => {
    const email = 'example@example.com';
    const resultado = reviewEmail(email);
    expect(resultado).toBe('example@example.com');
  });
});

describe('reviewPassword', () => {
    it('deve retornar a senha se tiver 6 caracteres ou mais', () => {
        const password = 'senha123';
        const resultado = reviewPassword(password);
        expect(resultado).toBe('senha123');
    });

    it('deve retornar uma string vazia se a senha tiver menos de 6 caracteres', () => {
        const password = 'abc12';
        const resultado = reviewPassword(password);
        expect(resultado).toBe('');
    });

    it('deve retornar a senha original se ela tiver exatamente 6 caracteres', () => {
        const password = 'abc123';
        const resultado = reviewPassword(password);
        expect(resultado).toBe('abc123');
    });

    it('deve retornar a senha original se ela tiver mais de 6 caracteres', () => {
        const password = 'senha12345';
        const resultado = reviewPassword(password);
        expect(resultado).toBe('senha12345');
    });
});