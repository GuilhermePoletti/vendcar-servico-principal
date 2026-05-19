import { Marca, MarcaProps } from '../../src/domain/entities/marca.entity';

describe('Marca Entity', () => {
  const validProps: MarcaProps = {
    nome: 'Toyota',
  };

  describe('Criação bem-sucedida', () => {
    it('deve criar uma Marca válida', () => {
      const marca = new Marca(validProps);

      expect(marca.nome).toBe(validProps.nome);
    });

    it('deve gerar um ID (UUID) automaticamente', () => {
      const marca = new Marca(validProps);

      expect(marca.id).toBeDefined();
      expect(marca.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('deve aceitar ID fornecido externamente', () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const marca = new Marca({ ...validProps, id });

      expect(marca.id).toBe(id);
    });
  });

  describe('Validação do nome', () => {
    it('deve lançar erro quando nome é vazio', () => {
      expect(() => new Marca({ nome: '' })).toThrow();
    });

    it('deve lançar erro quando nome tem menos de 2 caracteres', () => {
      expect(() => new Marca({ nome: 'A' })).toThrow();
    });

    it('deve aceitar nome com exatamente 2 caracteres', () => {
      const marca = new Marca({ nome: 'BM' });
      expect(marca.nome).toBe('BM');
    });

    it('deve lançar erro quando nome contém apenas espaços', () => {
      expect(() => new Marca({ nome: '   ' })).toThrow();
    });
  });

  describe('Imutabilidade', () => {
    it('não deve permitir alteração direta das propriedades', () => {
      const marca = new Marca(validProps);

      expect(() => {
        (marca as any).nome = 'Honda';
      }).toThrow();
    });
  });
});
