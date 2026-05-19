import { Cliente, ClienteProps } from '../../src/domain/entities/cliente.entity';

describe('Cliente Entity', () => {
  const validProps: ClienteProps = {
    nome: 'João da Silva',
    cpf: '52998224725',
    email: 'joao@email.com',
  };

  // ─────────────────────────────────────────────
  // CRIAÇÃO COM SUCESSO
  // ─────────────────────────────────────────────

  describe('Criação bem-sucedida', () => {
    it('deve criar um Cliente válido com todos os campos obrigatórios', () => {
      const cliente = new Cliente(validProps);

      expect(cliente.nome).toBe(validProps.nome);
      expect(cliente.cpf).toBe(validProps.cpf);
      expect(cliente.email).toBe(validProps.email);
    });

    it('deve gerar um ID (UUID) automaticamente quando não fornecido', () => {
      const cliente = new Cliente(validProps);

      expect(cliente.id).toBeDefined();
      expect(typeof cliente.id).toBe('string');
      expect(cliente.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('deve aceitar um ID fornecido externamente', () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const cliente = new Cliente({ ...validProps, id });

      expect(cliente.id).toBe(id);
    });

    it('deve gerar IDs diferentes para instâncias diferentes', () => {
      const cliente1 = new Cliente(validProps);
      const cliente2 = new Cliente(validProps);

      expect(cliente1.id).not.toBe(cliente2.id);
    });
  });

  // ─────────────────────────────────────────────
  // VALIDAÇÃO DO NOME
  // ─────────────────────────────────────────────

  describe('Validação do nome', () => {
    it('deve lançar erro quando nome é vazio', () => {
      expect(() => new Cliente({ ...validProps, nome: '' })).toThrow();
    });

    it('deve lançar erro quando nome tem menos de 3 caracteres', () => {
      expect(() => new Cliente({ ...validProps, nome: 'AB' })).toThrow();
    });

    it('deve aceitar nome com exatamente 3 caracteres', () => {
      const cliente = new Cliente({ ...validProps, nome: 'Ana' });
      expect(cliente.nome).toBe('Ana');
    });

    it('deve lançar erro quando nome contém apenas espaços em branco', () => {
      expect(() => new Cliente({ ...validProps, nome: '   ' })).toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // VALIDAÇÃO DO CPF (formato simples: 11 dígitos)
  // ─────────────────────────────────────────────

  describe('Validação do CPF', () => {
    it('deve lançar erro quando CPF é vazio', () => {
      expect(() => new Cliente({ ...validProps, cpf: '' })).toThrow();
    });

    it('deve lançar erro quando CPF tem menos de 11 dígitos', () => {
      expect(() => new Cliente({ ...validProps, cpf: '1234567890' })).toThrow();
    });

    it('deve lançar erro quando CPF tem mais de 11 dígitos', () => {
      expect(() => new Cliente({ ...validProps, cpf: '123456789012' })).toThrow();
    });

    it('deve lançar erro quando CPF contém caracteres não-numéricos', () => {
      expect(() => new Cliente({ ...validProps, cpf: '529.982.247-25' })).toThrow();
    });

    it('deve lançar erro quando CPF contém letras', () => {
      expect(() => new Cliente({ ...validProps, cpf: '5299822472a' })).toThrow();
    });

    it('deve aceitar CPF com exatamente 11 dígitos numéricos', () => {
      const cliente = new Cliente({ ...validProps, cpf: '12345678901' });
      expect(cliente.cpf).toBe('12345678901');
    });
  });

  // ─────────────────────────────────────────────
  // VALIDAÇÃO DO EMAIL
  // ─────────────────────────────────────────────

  describe('Validação do email', () => {
    it('deve lançar erro quando email é vazio', () => {
      expect(() => new Cliente({ ...validProps, email: '' })).toThrow();
    });

    it('deve lançar erro quando email não contém @', () => {
      expect(() => new Cliente({ ...validProps, email: 'joaoemail.com' })).toThrow();
    });

    it('deve lançar erro quando email não contém domínio', () => {
      expect(() => new Cliente({ ...validProps, email: 'joao@' })).toThrow();
    });

    it('deve lançar erro quando email não contém parte local', () => {
      expect(() => new Cliente({ ...validProps, email: '@email.com' })).toThrow();
    });

    it('deve aceitar emails em formatos válidos', () => {
      const emailsValidos = [
        'joao@email.com',
        'joao.silva@empresa.com.br',
        'joao+tag@email.com',
        'user123@test.io',
      ];

      emailsValidos.forEach((email) => {
        const cliente = new Cliente({ ...validProps, email });
        expect(cliente.email).toBe(email);
      });
    });
  });

  // ─────────────────────────────────────────────
  // IMUTABILIDADE
  // ─────────────────────────────────────────────

  describe('Imutabilidade', () => {
    it('não deve permitir alteração direta das propriedades', () => {
      const cliente = new Cliente(validProps);

      expect(() => {
        (cliente as any).nome = 'Outro Nome';
      }).toThrow();

      expect(() => {
        (cliente as any).cpf = '00000000000';
      }).toThrow();

      expect(() => {
        (cliente as any).email = 'outro@email.com';
      }).toThrow();
    });
  });
});
