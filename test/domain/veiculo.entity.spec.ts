import { Veiculo, VeiculoProps } from '../../src/domain/entities/veiculo.entity';
import { StatusVeiculo } from '../../src/domain/enums/status-veiculo.enum';

describe('Veiculo Entity', () => {
  const marcaId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  const validProps: VeiculoProps = {
    idMarca: marcaId,
    modelo: 'Civic',
    ano: 2024,
    cor: 'Prata',
    preco: 135000.0,
  };

  // ─────────────────────────────────────────────
  // CRIAÇÃO COM SUCESSO
  // ─────────────────────────────────────────────

  describe('Criação bem-sucedida', () => {
    it('deve criar um Veículo válido com todos os campos obrigatórios', () => {
      const veiculo = new Veiculo(validProps);

      expect(veiculo.idMarca).toBe(validProps.idMarca);
      expect(veiculo.modelo).toBe(validProps.modelo);
      expect(veiculo.ano).toBe(validProps.ano);
      expect(veiculo.cor).toBe(validProps.cor);
      expect(veiculo.preco).toBe(validProps.preco);
    });

    it('deve gerar um ID (UUID) automaticamente quando não fornecido', () => {
      const veiculo = new Veiculo(validProps);

      expect(veiculo.id).toBeDefined();
      expect(typeof veiculo.id).toBe('string');
      expect(veiculo.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('deve aceitar um ID fornecido externamente', () => {
      const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const veiculo = new Veiculo({ ...validProps, id });

      expect(veiculo.id).toBe(id);
    });

    it('deve definir status como DISPONIVEL por padrão', () => {
      const veiculo = new Veiculo(validProps);

      expect(veiculo.status).toBe(StatusVeiculo.DISPONIVEL);
    });

    it('deve aceitar status fornecido explicitamente', () => {
      const veiculo = new Veiculo({
        ...validProps,
        status: StatusVeiculo.RESERVADO,
      });

      expect(veiculo.status).toBe(StatusVeiculo.RESERVADO);
    });
  });

  // ─────────────────────────────────────────────
  // VALIDAÇÃO DO MODELO
  // ─────────────────────────────────────────────

  describe('Validação do modelo', () => {
    it('deve lançar erro quando modelo é vazio', () => {
      expect(() => new Veiculo({ ...validProps, modelo: '' })).toThrow();
    });

    it('deve lançar erro quando modelo tem menos de 2 caracteres', () => {
      expect(() => new Veiculo({ ...validProps, modelo: 'A' })).toThrow();
    });

    it('deve aceitar modelo com exatamente 2 caracteres', () => {
      const veiculo = new Veiculo({ ...validProps, modelo: 'Ka' });
      expect(veiculo.modelo).toBe('Ka');
    });

    it('deve lançar erro quando modelo contém apenas espaços', () => {
      expect(() => new Veiculo({ ...validProps, modelo: '   ' })).toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // VALIDAÇÃO DO ANO
  // ─────────────────────────────────────────────

  describe('Validação do ano', () => {
    it('deve lançar erro quando ano é menor que 1886', () => {
      expect(() => new Veiculo({ ...validProps, ano: 1885 })).toThrow();
    });

    it('deve aceitar ano igual a 1886', () => {
      const veiculo = new Veiculo({ ...validProps, ano: 1886 });
      expect(veiculo.ano).toBe(1886);
    });

    it('deve lançar erro quando ano é maior que o ano atual + 1', () => {
      const anoLimite = new Date().getFullYear() + 2;
      expect(() => new Veiculo({ ...validProps, ano: anoLimite })).toThrow();
    });

    it('deve aceitar ano igual ao ano atual + 1', () => {
      const anoProximo = new Date().getFullYear() + 1;
      const veiculo = new Veiculo({ ...validProps, ano: anoProximo });
      expect(veiculo.ano).toBe(anoProximo);
    });

    it('deve lançar erro quando ano não é um número inteiro', () => {
      expect(() => new Veiculo({ ...validProps, ano: 2024.5 })).toThrow();
    });

    it('deve lançar erro quando ano é negativo', () => {
      expect(() => new Veiculo({ ...validProps, ano: -1 })).toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // VALIDAÇÃO DA COR
  // ─────────────────────────────────────────────

  describe('Validação da cor', () => {
    it('deve lançar erro quando cor é vazia', () => {
      expect(() => new Veiculo({ ...validProps, cor: '' })).toThrow();
    });

    it('deve lançar erro quando cor contém apenas espaços', () => {
      expect(() => new Veiculo({ ...validProps, cor: '   ' })).toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // VALIDAÇÃO DO PREÇO
  // ─────────────────────────────────────────────

  describe('Validação do preço', () => {
    it('deve lançar erro quando preço é zero', () => {
      expect(() => new Veiculo({ ...validProps, preco: 0 })).toThrow();
    });

    it('deve lançar erro quando preço é negativo', () => {
      expect(() => new Veiculo({ ...validProps, preco: -1000 })).toThrow();
    });

    it('deve aceitar preço com casas decimais', () => {
      const veiculo = new Veiculo({ ...validProps, preco: 99999.99 });
      expect(veiculo.preco).toBe(99999.99);
    });
  });

  // ─────────────────────────────────────────────
  // VALIDAÇÃO DO idMarca
  // ─────────────────────────────────────────────

  describe('Validação do idMarca', () => {
    it('deve lançar erro quando idMarca é vazio', () => {
      expect(() => new Veiculo({ ...validProps, idMarca: '' })).toThrow();
    });

    it('deve lançar erro quando idMarca contém apenas espaços', () => {
      expect(() => new Veiculo({ ...validProps, idMarca: '   ' })).toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // TRANSIÇÕES DE STATUS (Máquina de Estados)
  // ─────────────────────────────────────────────

  describe('Transição de status: reservar()', () => {
    it('deve transicionar de DISPONIVEL para RESERVADO', () => {
      const veiculo = new Veiculo(validProps);
      expect(veiculo.status).toBe(StatusVeiculo.DISPONIVEL);

      veiculo.reservar();

      expect(veiculo.status).toBe(StatusVeiculo.RESERVADO);
    });

    it('deve lançar erro ao tentar reservar um veículo já RESERVADO', () => {
      const veiculo = new Veiculo({
        ...validProps,
        status: StatusVeiculo.RESERVADO,
      });

      expect(() => veiculo.reservar()).toThrow();
    });

    it('deve lançar erro ao tentar reservar um veículo VENDIDO', () => {
      const veiculo = new Veiculo({
        ...validProps,
        status: StatusVeiculo.VENDIDO,
      });

      expect(() => veiculo.reservar()).toThrow();
    });
  });

  describe('Transição de status: vender()', () => {
    it('deve transicionar de RESERVADO para VENDIDO', () => {
      const veiculo = new Veiculo({
        ...validProps,
        status: StatusVeiculo.RESERVADO,
      });

      veiculo.vender();

      expect(veiculo.status).toBe(StatusVeiculo.VENDIDO);
    });

    it('deve lançar erro ao tentar vender um veículo DISPONIVEL', () => {
      const veiculo = new Veiculo(validProps);

      expect(() => veiculo.vender()).toThrow();
    });

    it('deve lançar erro ao tentar vender um veículo já VENDIDO', () => {
      const veiculo = new Veiculo({
        ...validProps,
        status: StatusVeiculo.VENDIDO,
      });

      expect(() => veiculo.vender()).toThrow();
    });
  });

  describe('Transição de status: disponibilizar()', () => {
    it('deve transicionar de RESERVADO para DISPONIVEL', () => {
      const veiculo = new Veiculo({
        ...validProps,
        status: StatusVeiculo.RESERVADO,
      });

      veiculo.disponibilizar();

      expect(veiculo.status).toBe(StatusVeiculo.DISPONIVEL);
    });

    it('deve lançar erro ao tentar disponibilizar um veículo já DISPONIVEL', () => {
      const veiculo = new Veiculo(validProps);

      expect(() => veiculo.disponibilizar()).toThrow();
    });

    it('deve lançar erro ao tentar disponibilizar um veículo VENDIDO', () => {
      const veiculo = new Veiculo({
        ...validProps,
        status: StatusVeiculo.VENDIDO,
      });

      expect(() => veiculo.disponibilizar()).toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // FLUXO COMPLETO DA SAGA
  // ─────────────────────────────────────────────

  describe('Fluxo completo da SAGA', () => {
    it('deve permitir o fluxo feliz: DISPONIVEL → RESERVADO → VENDIDO', () => {
      const veiculo = new Veiculo(validProps);

      expect(veiculo.status).toBe(StatusVeiculo.DISPONIVEL);

      veiculo.reservar();
      expect(veiculo.status).toBe(StatusVeiculo.RESERVADO);

      veiculo.vender();
      expect(veiculo.status).toBe(StatusVeiculo.VENDIDO);
    });

    it('deve permitir o fluxo de compensação: DISPONIVEL → RESERVADO → DISPONIVEL', () => {
      const veiculo = new Veiculo(validProps);

      veiculo.reservar();
      expect(veiculo.status).toBe(StatusVeiculo.RESERVADO);

      veiculo.disponibilizar();
      expect(veiculo.status).toBe(StatusVeiculo.DISPONIVEL);
    });

    it('deve permitir reservar novamente após compensação', () => {
      const veiculo = new Veiculo(validProps);

      veiculo.reservar();
      veiculo.disponibilizar();

      veiculo.reservar();
      expect(veiculo.status).toBe(StatusVeiculo.RESERVADO);

      veiculo.vender();
      expect(veiculo.status).toBe(StatusVeiculo.VENDIDO);
    });
  });

  // ─────────────────────────────────────────────
  // IMUTABILIDADE (exceto status via métodos)
  // ─────────────────────────────────────────────

  describe('Imutabilidade', () => {
    it('não deve permitir alteração direta das propriedades base', () => {
      const veiculo = new Veiculo(validProps);

      expect(() => {
        (veiculo as any).modelo = 'Corolla';
      }).toThrow();

      expect(() => {
        (veiculo as any).preco = 999999;
      }).toThrow();
    });

    it('não deve permitir alteração direta do status', () => {
      const veiculo = new Veiculo(validProps);

      expect(() => {
        (veiculo as any).status = StatusVeiculo.VENDIDO;
      }).toThrow();
    });
  });
});
