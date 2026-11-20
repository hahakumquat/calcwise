import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

function parseIp(s: string): number | null {
  const m = s.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const o = m.slice(1).map(Number);
  if (o.some((x) => x > 255)) return null;
  return ((o[0] * 256 + o[1]) * 256 + o[2]) * 256 + o[3];
}
function fmt(n: number): string {
  return [Math.floor(n / 16777216) % 256, Math.floor(n / 65536) % 256, Math.floor(n / 256) % 256, n % 256].join('.');
}

export default defineCalculator({
  slug: 'cidr-calculator',
  title: 'IPv4 Subnet (CIDR) Calculator',
  category: 'developer',
  description: 'Enter an IPv4 address and prefix length to get the netmask, wildcard mask, network and broadcast addresses, host range and usable host count.',
  metaDescription: 'IPv4 subnet calculator: enter an address and CIDR prefix to get the netmask, network, broadcast, first and last host and number of usable hosts.',
  updated: '2026-11-20',
  keywords: ['cidr calculator', 'subnet calculator', 'ipv4 subnet calculator', 'cidr to netmask', 'usable hosts calculator', 'wildcard mask calculator'],
  inputs: [
    { id: 'ip', label: 'IPv4 address', type: 'text', default: '192.168.1.130', placeholder: 'e.g. 192.168.1.130', info: 'Four numbers from 0 to 255 separated by dots. Any address inside the subnet works.' },
    { id: 'prefix', label: 'Prefix length (/n)', type: 'number', default: 26, min: 0, max: 32, step: 1, info: 'The number of leading bits that identify the network, 0 to 32. /24 is 255.255.255.0.' },
  ],
  outputs: [
    { id: 'usable', label: 'Usable hosts', format: 'number', precision: 0, primary: true, info: 'Addresses you can assign to devices: 2^(32 − n) − 2 for /30 or shorter, 2 for /31 (point-to-point links, RFC 3021), 1 for /32.' },
    { id: 'mask', label: 'Netmask', format: 'text', info: 'The subnet mask in dotted decimal.' },
    { id: 'wildcard', label: 'Wildcard mask', format: 'text', info: 'The inverse of the netmask, used in some router access lists.' },
    { id: 'network', label: 'Network address', format: 'text', info: 'The first address of the block, with all host bits zero.' },
    { id: 'broadcast', label: 'Broadcast address', format: 'text', info: 'The last address of the block, with all host bits one.' },
    { id: 'first', label: 'First host', format: 'text', info: 'The first assignable address.' },
    { id: 'last', label: 'Last host', format: 'text', info: 'The last assignable address.' },
    { id: 'total', label: 'Total addresses', format: 'number', precision: 0, info: '2^(32 − n), including the network and broadcast addresses.' },
  ],
  compute: (v) => {
    const addr = parseIp(String(v.ip ?? ''));
    const p = num(v.prefix);
    if (addr === null) return { usable: null, error: 'Enter an IPv4 address like 192.168.1.130 (four numbers from 0 to 255).' };
    if (p === null || !Number.isInteger(p) || p < 0 || p > 32) return { usable: null, error: 'The prefix length must be a whole number from 0 to 32.' };
    const total = 2 ** (32 - p);
    const network = Math.floor(addr / total) * total;
    const broadcast = network + total - 1;
    const maskNum = 4294967296 - total;
    const usable = p >= 31 ? total : total - 2;
    const first = p >= 31 ? network : network + 1;
    const last = p >= 31 ? broadcast : broadcast - 1;
    return {
      usable,
      mask: fmt(maskNum),
      wildcard: fmt(total - 1),
      network: fmt(network),
      broadcast: fmt(broadcast),
      first: fmt(first),
      last: fmt(last),
      total,
      steps: [
        `/${p} leaves ${32 - p} host bits, so the block holds 2^${32 - p} = ${total.toLocaleString('en-US')} addresses`,
        `Netmask ${fmt(maskNum)}; network = address with host bits cleared = ${fmt(network)}`,
        `Broadcast = network + ${total - 1} = ${fmt(broadcast)}; hosts ${fmt(first)} to ${fmt(last)}`,
      ],
    };
  },
  content: {
    formula: ['total addresses = 2^(32 − n)', 'usable hosts = total − 2 (for /30 or shorter)', 'network = address AND netmask', 'broadcast = network + total − 1'],
    body: [
      'CIDR (Classless Inter-Domain Routing) writes a network as an address plus a prefix length, such as 192.168.1.128/26. The prefix is the number of leading bits shared by every address in the block; the remaining bits identify the host.',
      'For 192.168.1.130/26 the netmask is 255.255.255.192. That leaves 6 host bits, so the block has 64 addresses: network 192.168.1.128, broadcast 192.168.1.191, and 62 usable hosts from .129 to .190.',
      'The first address (network) and last address (broadcast) are reserved, which is why usable hosts are two fewer than the total. A /31 has two usable addresses for point-to-point links (RFC 3021), and a /32 is a single host.',
      'This calculator covers IPv4 only and runs entirely in your browser; nothing is sent anywhere.',
    ],
    faq: [
      { q: 'How many usable hosts are in a /24?', a: '254. A /24 has 256 addresses, minus the network and broadcast addresses.' },
      { q: 'What is the netmask for /26?', a: '255.255.255.192, which gives 64 addresses and 62 usable hosts.' },
      { q: 'What is a wildcard mask?', a: 'The bitwise inverse of the netmask. For 255.255.255.192 it is 0.0.0.63. Some router access lists use it instead of the netmask.' },
    ],
    sources: [{ label: 'RFC 4632: Classless Inter-domain Routing (CIDR)', url: 'https://www.rfc-editor.org/rfc/rfc4632' }, { label: 'RFC 3021: Using 31-Bit Prefixes on IPv4 Point-to-Point Links', url: 'https://www.rfc-editor.org/rfc/rfc3021' }],
  },
  related: ['number-base-converter', 'download-time', 'chmod-calculator'],
  examples: [
    { values: { ip: '192.168.1.130', prefix: 26 }, expect: { usable: 62, mask: '255.255.255.192', network: '192.168.1.128', broadcast: '192.168.1.191', first: '192.168.1.129', last: '192.168.1.190', wildcard: '0.0.0.63', total: 64 } },
    { values: { ip: '10.0.0.5', prefix: 8 }, expect: { usable: 16777214, mask: '255.0.0.0', network: '10.0.0.0', broadcast: '10.255.255.255' } },
    { values: { ip: '172.16.5.9', prefix: 31 }, expect: { usable: 2, network: '172.16.5.8', first: '172.16.5.8', last: '172.16.5.9' } },
    { values: { ip: '8.8.8.8', prefix: 32 }, expect: { usable: 1, mask: '255.255.255.255', network: '8.8.8.8' } },
    { values: { ip: '203.0.113.77', prefix: 0 }, expect: { usable: 4294967294, mask: '0.0.0.0', network: '0.0.0.0', broadcast: '255.255.255.255' } },
  ],
});
