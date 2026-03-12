 SELECT DISTINCT ON (p.asset_id)
 p.id,
          p.asset_id,
          a.symbol,
          a.address,
          p.price_usd,
          p.timestamp
        FROM prices p
          INNER JOIN assets a ON a.id = p.asset_id
          ORDER BY p.asset_id, p.timestamp DESC;

        UPDATE prices SET price_usd=1500 WHERE asset_id = 87769;