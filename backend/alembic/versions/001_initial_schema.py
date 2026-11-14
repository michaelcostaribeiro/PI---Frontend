"""Create Affiliate KPI schema and seed data."""

from alembic import op
import sqlalchemy as sa

revision = "001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS usuario (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          email VARCHAR(150) NOT NULL,
          senha_hash VARCHAR(255) NOT NULL,
          tipo ENUM('AFILIADO', 'LOJA') NOT NULL,
          criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_usuario_email UNIQUE (email)
        ) ENGINE = InnoDB
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS loja (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT UNSIGNED NOT NULL,
          nome VARCHAR(120) NOT NULL,
          CONSTRAINT uq_loja_nome UNIQUE (nome),
          CONSTRAINT fk_loja_usuario FOREIGN KEY (usuario_id)
            REFERENCES usuario (id) ON DELETE RESTRICT
        ) ENGINE = InnoDB
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS categoria (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(80) NOT NULL,
          CONSTRAINT uq_categoria_nome UNIQUE (nome)
        ) ENGINE = InnoDB
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS produto (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          loja_id INT UNSIGNED NOT NULL,
          categoria_id INT UNSIGNED NOT NULL,
          nome VARCHAR(150) NOT NULL,
          fabricante VARCHAR(100) NULL,
          imagem_url VARCHAR(500) NULL,
          preco DECIMAL(10,2) NOT NULL,
          criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_produto_loja FOREIGN KEY (loja_id) REFERENCES loja (id),
          CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id) REFERENCES categoria (id),
          CONSTRAINT ck_produto_preco CHECK (preco >= 0)
        ) ENGINE = InnoDB
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS afiliacao (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT UNSIGNED NOT NULL,
          produto_id INT UNSIGNED NOT NULL,
          link_afiliado VARCHAR(500) NOT NULL,
          comissao_percentual DECIMAL(5,2) NOT NULL,
          ativo BOOLEAN NOT NULL DEFAULT TRUE,
          criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT uq_afiliacao UNIQUE (usuario_id, produto_id),
          CONSTRAINT fk_afiliacao_usuario FOREIGN KEY (usuario_id)
            REFERENCES usuario (id) ON DELETE CASCADE,
          CONSTRAINT fk_afiliacao_produto FOREIGN KEY (produto_id)
            REFERENCES produto (id) ON DELETE CASCADE,
          CONSTRAINT ck_afiliacao_pct CHECK (comissao_percentual BETWEEN 0 AND 100)
        ) ENGINE = InnoDB
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS metrica_diaria (
          id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          afiliacao_id INT UNSIGNED NOT NULL,
          data DATE NOT NULL,
          visualizacoes INT UNSIGNED NOT NULL DEFAULT 0,
          cliques INT UNSIGNED NOT NULL DEFAULT 0,
          vendas INT UNSIGNED NOT NULL DEFAULT 0,
          comissao_gerada DECIMAL(10,2) NOT NULL DEFAULT 0,
          CONSTRAINT uq_metrica_dia UNIQUE (afiliacao_id, data),
          CONSTRAINT fk_metrica_afiliacao FOREIGN KEY (afiliacao_id)
            REFERENCES afiliacao (id) ON DELETE CASCADE
        ) ENGINE = InnoDB
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS notificacao (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT UNSIGNED NOT NULL,
          mensagem VARCHAR(255) NOT NULL,
          criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          visto_em DATETIME NULL,
          CONSTRAINT fk_notificacao_usuario FOREIGN KEY (usuario_id)
            REFERENCES usuario (id) ON DELETE CASCADE
        ) ENGINE = InnoDB
    """)
    op.execute("""
        CREATE INDEX ix_notificacao_nao_lida
        ON notificacao (usuario_id, visto_em)
    """)

    op.execute("""
        INSERT INTO usuario (id, nome, email, senha_hash, tipo) VALUES
        (1, 'Lucas Souza', 'lucas@exemplo.com', '$2y$10$TesteMock10', 'AFILIADO'),
        (2, 'Camila Alves', 'camila@exemplo.com', '$4y$10$TesteMock20', 'LOJA'),
        (3, 'Ana Ribeiro', 'ana@exemplo.com', '$5y$10$TesteMock30', 'AFILIADO'),
        (4, 'Maria Luiza', 'maria@exemplo.com', '$7y$10$TesteMock60', 'LOJA')
        ON DUPLICATE KEY UPDATE nome = VALUES(nome), tipo = VALUES(tipo)
    """)
    op.execute("""
        INSERT INTO loja (id, usuario_id, nome) VALUES
        (1, 2, 'Casa da Camila'), (2, 4, 'Loja da Maria')
        ON DUPLICATE KEY UPDATE usuario_id = VALUES(usuario_id), nome = VALUES(nome)
    """)
    op.execute("""
        INSERT INTO categoria (id, nome) VALUES
        (1, 'Casa e Cozinha'), (2, 'Eletrônicos'), (3, 'Beleza')
        ON DUPLICATE KEY UPDATE nome = VALUES(nome)
    """)
    op.execute("""
        INSERT INTO produto
          (id, loja_id, categoria_id, nome, fabricante, imagem_url, preco)
        VALUES
        (1, 1, 1, 'Copo Térmico Stanley com Tampa', 'Stanley',
          'https://placehold.co/400?text=Stanley', 179.90),
        (2, 2, 2, 'Relógio Apple Watch Ultra Azul', 'Apple',
          'https://placehold.co/400?text=Apple', 7999.00),
        (3, 1, 3, 'Kit de Pincéis Eudora', 'Eudora',
          'https://placehold.co/400?text=Eudora', 89.90),
        (4, 2, 1, 'Organizador de Gaveta 6 Divisórias', 'Casa da Camila',
          'https://placehold.co/400?text=Organizador', 59.90)
        ON DUPLICATE KEY UPDATE
          nome = VALUES(nome), fabricante = VALUES(fabricante),
          imagem_url = VALUES(imagem_url), preco = VALUES(preco)
    """)
    op.execute("""
        INSERT INTO afiliacao
          (id, usuario_id, produto_id, link_afiliado, comissao_percentual)
        VALUES
        (1, 1, 1, 'https://vt.tiktok.com/exemplo-lucas-stanley', 12.00),
        (2, 1, 2, 'https://vt.tiktok.com/exemplo-lucas-watch', 3.00),
        (3, 1, 3, 'https://vt.tiktok.com/exemplo-lucas-pinceis', 15.00),
        (4, 1, 4, 'https://vt.tiktok.com/exemplo-lucas-organizador', 18.00),
        (5, 3, 4, 'https://vt.tiktok.com/exemplo-ana-organizador', 18.00)
        ON DUPLICATE KEY UPDATE
          link_afiliado = VALUES(link_afiliado),
          comissao_percentual = VALUES(comissao_percentual)
    """)

    metrics = [
        (1, "2026-08-03", 12980, 1507, 10, 215.88),
        (1, "2026-08-04", 16520, 1918, 13, 280.64),
        (1, "2026-08-05", 14160, 1644, 11, 237.47),
        (1, "2026-08-06", 18880, 2192, 14, 302.23),
        (1, "2026-08-07", 15340, 1781, 12, 259.06),
        (1, "2026-08-08", 18880, 2192, 14, 302.23),
        (1, "2026-08-09", 21240, 2466, 19, 410.17),
        (1, "2026-08-10", 16753, 1914, 11, 237.47),
        (1, "2026-08-11", 21322, 2436, 14, 302.23),
        (1, "2026-08-12", 18276, 2088, 12, 259.06),
        (1, "2026-08-13", 24368, 2784, 16, 345.41),
        (1, "2026-08-14", 19799, 2262, 13, 280.64),
        (1, "2026-08-15", 24368, 2784, 16, 345.41),
        (1, "2026-08-16", 27414, 3132, 20, 431.76),
        (2, "2026-08-03", 67100, 9724, 21, 5039.37),
        (2, "2026-08-04", 85400, 12376, 27, 6479.19),
        (2, "2026-08-05", 73200, 10608, 23, 5519.31),
        (2, "2026-08-06", 97600, 14144, 31, 7439.07),
        (2, "2026-08-07", 79300, 11492, 25, 5999.25),
        (2, "2026-08-08", 97600, 14144, 31, 7439.07),
        (2, "2026-08-09", 109800, 15912, 38, 9118.86),
        (2, "2026-08-10", 75240, 11011, 22, 5279.34),
        (2, "2026-08-11", 95760, 14014, 29, 6959.13),
        (2, "2026-08-12", 82080, 12012, 25, 5999.25),
        (2, "2026-08-13", 109440, 16016, 33, 7919.01),
        (2, "2026-08-14", 88920, 13013, 27, 6479.19),
        (2, "2026-08-15", 109440, 16016, 33, 7919.01),
        (2, "2026-08-16", 123120, 18018, 40, 9598.80),
        (3, "2026-08-03", 7810, 979, 2, 26.97),
        (3, "2026-08-04", 9940, 1246, 3, 40.46),
        (3, "2026-08-05", 8520, 1068, 3, 40.46),
        (3, "2026-08-06", 11360, 1424, 4, 53.94),
        (3, "2026-08-07", 9230, 1157, 3, 40.46),
        (3, "2026-08-08", 11360, 1424, 4, 53.94),
        (3, "2026-08-09", 12780, 1602, 8, 107.88),
        (3, "2026-08-10", 8415, 1067, 2, 26.97),
        (3, "2026-08-11", 10710, 1358, 3, 40.46),
        (3, "2026-08-12", 9180, 1164, 3, 40.46),
        (3, "2026-08-13", 12240, 1552, 4, 53.94),
        (3, "2026-08-14", 9945, 1261, 3, 40.46),
        (3, "2026-08-15", 12240, 1552, 4, 53.94),
        (3, "2026-08-16", 13770, 1746, 6, 80.91),
        (4, "2026-08-03", 4422, 341, 5, 53.91),
        (4, "2026-08-04", 5628, 434, 6, 64.69),
        (4, "2026-08-05", 4824, 372, 5, 53.91),
        (4, "2026-08-06", 6432, 496, 7, 75.47),
        (4, "2026-08-07", 5226, 403, 6, 64.69),
        (4, "2026-08-08", 6432, 496, 7, 75.47),
        (4, "2026-08-09", 7236, 558, 12, 129.38),
        (4, "2026-08-10", 5148, 401, 6, 64.69),
        (4, "2026-08-11", 6552, 511, 7, 75.47),
        (4, "2026-08-12", 5616, 438, 6, 64.69),
        (4, "2026-08-13", 7488, 584, 9, 97.04),
        (4, "2026-08-14", 6084, 474, 7, 75.47),
        (4, "2026-08-15", 7488, 584, 9, 97.04),
        (4, "2026-08-16", 8424, 658, 13, 140.17),
        (5, "2026-08-03", 2475, 165, 2, 21.56),
        (5, "2026-08-04", 3150, 210, 2, 21.56),
        (5, "2026-08-05", 2700, 180, 2, 21.56),
        (5, "2026-08-06", 3600, 240, 3, 32.35),
        (5, "2026-08-07", 2925, 195, 2, 21.56),
        (5, "2026-08-08", 3600, 240, 3, 32.35),
        (5, "2026-08-09", 4050, 270, 5, 53.91),
        (5, "2026-08-10", 2310, 151, 1, 10.78),
        (5, "2026-08-11", 2940, 193, 2, 21.56),
        (5, "2026-08-12", 2520, 165, 2, 21.56),
        (5, "2026-08-13", 3360, 220, 2, 21.56),
        (5, "2026-08-14", 2730, 179, 2, 21.56),
        (5, "2026-08-15", 3360, 220, 2, 21.56),
        (5, "2026-08-16", 3780, 252, 6, 64.69),
    ]
    connection = op.get_bind()
    for metric in metrics:
        connection.execute(
            sa.text(
                """
            INSERT INTO metrica_diaria
              (afiliacao_id, data, visualizacoes, cliques, vendas, comissao_gerada)
            VALUES (:afiliacao_id, :data, :visualizacoes, :cliques, :vendas, :comissao_gerada)
            ON DUPLICATE KEY UPDATE
              visualizacoes = VALUES(visualizacoes), cliques = VALUES(cliques),
              vendas = VALUES(vendas), comissao_gerada = VALUES(comissao_gerada)
                """
            ),
            {
                "afiliacao_id": metric[0],
                "data": metric[1],
                "visualizacoes": metric[2],
                "cliques": metric[3],
                "vendas": metric[4],
                "comissao_gerada": metric[5],
            },
        )

    op.execute("""
        INSERT INTO notificacao (id, usuario_id, mensagem, visto_em) VALUES
        (1, 1, 'Copo Térmico Stanley teve alta de 27% nos cliques esta semana.', NULL),
        (2, 1, 'Kit de Pincéis Eudora teve queda nas vendas esta semana.', NULL),
        (3, 2, 'Novo afiliado divulgando Organizador de Gaveta 6 Divisórias.',
          '2026-08-12 09:30:00')
        ON DUPLICATE KEY UPDATE
          mensagem = VALUES(mensagem), visto_em = VALUES(visto_em)
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS notificacao")
    op.execute("DROP TABLE IF EXISTS metrica_diaria")
    op.execute("DROP TABLE IF EXISTS afiliacao")
    op.execute("DROP TABLE IF EXISTS produto")
    op.execute("DROP TABLE IF EXISTS categoria")
    op.execute("DROP TABLE IF EXISTS loja")
    op.execute("DROP TABLE IF EXISTS usuario")
